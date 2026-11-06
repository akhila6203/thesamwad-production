const { query } = require("../utils/dbQuery");
const { STUDENT_COUNT_SQL, mapCourseRow } = require("../utils/courseMapper");
const { PREVIEW_LESSON_COUNT } = require("../utils/enrollmentHelpers");
const {
  getProgressForEnrollment,
  syncStudentProfileProgress,
  getUserClassLevel,
} = require("../utils/progressHelpers");

async function fetchQuizScoresByEnrollmentIds(enrollmentIds) {
  if (!enrollmentIds.length) return new Map();

  const placeholders = enrollmentIds.map(() => "?").join(",");
  const rows = await query(
    `SELECT enrollment_id, quiz_id, quiz_title, score, total, completed_at
     FROM course_quiz_scores
     WHERE enrollment_id IN (${placeholders})
     ORDER BY completed_at ASC, quiz_id ASC`,
    enrollmentIds
  );

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.enrollment_id)) map.set(row.enrollment_id, []);
    map.get(row.enrollment_id).push({
      quizId: row.quiz_id,
      quizTitle: row.quiz_title,
      score: row.score,
      total: row.total,
      completedAt: row.completed_at,
    });
  }
  return map;
}


async function syncEnrollmentQuizAggregate(enrollmentId) {
  const rows = await query(
    `SELECT COALESCE(SUM(score), 0) AS score_sum,
            COALESCE(SUM(total), 0) AS total_sum,
            MAX(completed_at) AS latest_completed_at
     FROM course_quiz_scores
     WHERE enrollment_id = ?`,
    [enrollmentId]
  );

  const scoreSum = Number(rows[0]?.score_sum) || 0;
  const totalSum = Number(rows[0]?.total_sum) || 0;
  const latestCompletedAt = rows[0]?.latest_completed_at || null;

  await query(
    `UPDATE course_enrollments
     SET quiz_score = ?, quiz_total = ?,
         quiz_completed_at = COALESCE(?, quiz_completed_at)
     WHERE id = ?`,
    [
      totalSum > 0 ? scoreSum : null,
      totalSum > 0 ? totalSum : null,
      latestCompletedAt,
      enrollmentId,
    ]
  );

  return { scoreSum, totalSum, latestCompletedAt };
}




exports.getMyCourses = async (req, res) => {
  try {
    const classLevel = await getUserClassLevel(req.user.id);
    const classParams = [];
    let classFilter = "";

    if (classLevel) {
      classFilter = " AND c.class_level = ?";
      classParams.push(classLevel);
    }

    const classCourses = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
       FROM courses c
       WHERE c.status = 'Active'${classFilter}
       ORDER BY c.subject ASC, c.title ASC`,
      classParams
    );

    const enrollments = await query(
      `SELECT e.* FROM course_enrollments e
       WHERE e.user_id = ? AND e.status IN ('active', 'completed')`,
      [req.user.id]
    );
    const enrollmentByCourse = new Map(
      enrollments.map((e) => [e.course_id, e])
    );
    const enrollmentIds = enrollments.map((e) => e.id);
    const quizScoresByEnrollment = await fetchQuizScoresByEnrollmentIds(enrollmentIds);

    const courses = [];
    let completedCount = 0;
    let totalHours = 0;
    let totalDays = 0;

    for (const row of classCourses) {
      const enrollment = enrollmentByCourse.get(row.id);
      let progress = {
        percent: 0,
        completedUnits: 0,
        totalUnits: 0,
        courseComplete: false,
        quizDone: false,
      };
      let status = "pending";

      if (enrollment) {
        progress = await getProgressForEnrollment(enrollment.id, row.id);
        status =
          enrollment.status === "completed" ||
          (progress.quizDone && progress.courseComplete)
            ? "completed"
            : progress.completedUnits > 0
              ? "active"
              : "pending";

        if (status === "completed") completedCount += 1;

        const started = enrollment.started_at || enrollment.enrolled_at;
        const ended = enrollment.quiz_completed_at || enrollment.completed_at;
        if (started && ended) {
          const days = Math.max(
            1,
            Math.ceil((new Date(ended) - new Date(started)) / (1000 * 60 * 60 * 24))
          );
          totalDays += days;
        }
      } else {
        const units = await query(
          `SELECT
            (SELECT COUNT(*) FROM course_videos WHERE course_id = ?) +
            (SELECT COUNT(*) FROM course_materials WHERE course_id = ?) AS total`,
          [row.id, row.id]
        );
        progress.totalUnits = Number(units[0]?.total) || 0;
      }

      totalHours += progress.completedUnits * 0.5;

      const quizScores = enrollment
        ? quizScoresByEnrollment.get(enrollment.id) || []
        : [];

      courses.push({
        enrollmentId: enrollment?.id || null,
        courseId: row.id,
        title: row.title,
        category: row.class_level,
        subCategory: row.subject,
        thumbnail: row.thumbnail,
        instructor: row.instructor,
        ...mapCourseRow(row),
        progressPercent: progress.percent,
        completedUnits: progress.completedUnits,
        totalUnits: progress.totalUnits,
        courseComplete: progress.courseComplete,
        quizDone: progress.quizDone,
        status,
        enrolledAt: enrollment?.enrolled_at || null,
        startedAt: enrollment?.started_at || null,
        completedAt: enrollment?.completed_at || null,
        quizCompletedAt: enrollment?.quiz_completed_at || null,
        quizScore: enrollment?.quiz_score ?? null,
        quizTotal: enrollment?.quiz_total ?? null,
        quizScores,
      });
    }

    const enrolled = courses.filter((c) => c.enrollmentId).length;
    const started = courses.filter((c) => c.startedAt || c.completedUnits > 0).length;
    const avgDays =
      completedCount > 0 ? Math.round(totalDays / completedCount) : 0;

    res.json({
      stats: {
        started,
        enrolled,
        completed: completedCount,
        hoursLearned: Math.round(totalHours),
        daysToComplete: avgDays,
      },
      courses,
      previewLessonCount: PREVIEW_LESSON_COUNT,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load my courses" });
  }
};

exports.markLessonProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonKey, lessonType = "video" } = req.body;

    if (!lessonKey) {
      return res.status(400).json({ message: "lessonKey is required" });
    }

    const enrollments = await query(
      `SELECT id, started_at FROM course_enrollments
       WHERE user_id = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({ message: "Enroll in this course first" });
    }

    const enrollmentId = enrollments[0].id;

    await query(
      `INSERT INTO course_lesson_progress (enrollment_id, lesson_key, lesson_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE completed_at = NOW()`,
      [enrollmentId, lessonKey, lessonType]
    );

    if (!enrollments[0].started_at) {
      await query(
        "UPDATE course_enrollments SET started_at = NOW() WHERE id = ? AND started_at IS NULL",
        [enrollmentId]
      );
    }

    const progress = await getProgressForEnrollment(enrollmentId, courseId);

    if (progress.courseComplete && !progress.quizDone) {
      await query(
        "UPDATE course_enrollments SET completed_at = NOW() WHERE id = ? AND completed_at IS NULL",
        [enrollmentId]
      );
    }

    await syncStudentProfileProgress(req.user.id);

    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

exports.completeQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const scoreRaw = req.body?.score;
    const totalRaw = req.body?.total;
    const quizIdRaw = req.body?.quizId;

    const score =
      scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== ""
        ? Math.max(0, parseInt(scoreRaw, 10))
        : null;
    const total =
      totalRaw !== undefined && totalRaw !== null && totalRaw !== ""
        ? Math.max(0, parseInt(totalRaw, 10))
        : null;
    const quizId =
      quizIdRaw !== undefined && quizIdRaw !== null && quizIdRaw !== ""
        ? parseInt(quizIdRaw, 10)
        : null;

    if (
      score === null ||
      total === null ||
      Number.isNaN(score) ||
      Number.isNaN(total) ||
      total <= 0 ||
      score > total
    ) {
      return res.status(400).json({ message: "Valid quiz score and total are required" });
    }

    const enrollments = await query(
      `SELECT id FROM course_enrollments
       WHERE user_id = ? AND course_id = ?
         AND status IN ('active', 'completed') LIMIT 1`,
      [req.user.id, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({ message: "Enroll in this course first" });
    }

    const enrollmentId = enrollments[0].id;
    const progress = await getProgressForEnrollment(enrollmentId, courseId);

    // if (!progress.courseComplete) {
    //   return res.status(403).json({
    //     message: "Complete all lessons and materials before starting the quiz",
    //     courseComplete: false,
    //   });
    // }
    if (
  progress.videosCount === 0 ||
  progress.videosDone < progress.videosCount
) {
  return res.status(403).json({
    message: "Complete all lessons before starting the quiz",
    videosDone: progress.videosDone,
    videosCount: progress.videosCount,
  });
}

    const quizRows = await query(
      "SELECT id, quiz_title FROM course_quizzes WHERE course_id = ? ORDER BY id",
      [courseId]
    );

    let targetQuiz = null;
    if (quizId && !Number.isNaN(quizId)) {
      targetQuiz = quizRows.find((q) => q.id === quizId) || null;
    }
    if (!targetQuiz && quizRows.length === 1) {
      targetQuiz = quizRows[0];
    }
    if (!targetQuiz && quizRows.length > 0) {
      return res.status(400).json({ message: "quizId is required for this course" });
    }

    const lessonKey = targetQuiz ? `quiz:${targetQuiz.id}` : "quiz:all";

    await query(
      `INSERT INTO course_lesson_progress (enrollment_id, lesson_key, lesson_type)
       VALUES (?, ?, 'quiz')
       ON DUPLICATE KEY UPDATE completed_at = NOW()`,
      [enrollmentId, lessonKey]
    );

    if (targetQuiz) {
      await query(
        `INSERT INTO course_quiz_scores
          (enrollment_id, quiz_id, quiz_title, score, total, completed_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           quiz_title = VALUES(quiz_title),
           score = VALUES(score),
           total = VALUES(total),
           completed_at = NOW()`,
        [enrollmentId, targetQuiz.id, targetQuiz.quiz_title || "Quiz", score, total]
      );
      await syncEnrollmentQuizAggregate(enrollmentId);
    } else {
      await query(
        `UPDATE course_enrollments
         SET quiz_completed_at = NOW(), quiz_score = ?, quiz_total = ?
         WHERE id = ?`,
        [score, total, enrollmentId]
      );
    }

    const updatedProgress = await getProgressForEnrollment(enrollmentId, courseId);
    const allQuizzesDone = updatedProgress.quizDone;

    if (allQuizzesDone) {
      await query(
        `UPDATE course_enrollments
         SET quiz_completed_at = NOW(), completed_at = NOW(), status = 'completed'
         WHERE id = ?`,
        [enrollmentId]
      );
    } else {
      await query(
        `UPDATE course_enrollments
         SET status = 'active', completed_at = NULL
         WHERE id = ? AND status = 'completed'`,
        [enrollmentId]
      );
    }

    await syncStudentProfileProgress(req.user.id);

    const quizScores = (await fetchQuizScoresByEnrollmentIds([enrollmentId])).get(
      enrollmentId
    ) || [];

    res.json({
      message: "Quiz completed",
      status: allQuizzesDone ? "completed" : "active",
      score,
      total,
      quizId: targetQuiz?.id || null,
      quizScores,
      progress: updatedProgress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete quiz" });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    await query(
      "DELETE FROM course_enrollments WHERE user_id = ? AND course_id = ?",
      [req.user.id, courseId]
    );

    res.json({ message: "Removed from my courses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove enrollment" });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    const enrolled = await query(
      "SELECT course_id FROM course_enrollments WHERE user_id = ?",
      [req.user.id]
    );
    const enrolledIds = new Set(enrolled.map((e) => e.course_id));

    const enrolledCourses = await query(
      `SELECT class_level, subject FROM courses
       WHERE id IN (${enrolled.length ? enrolled.map((e) => e.course_id).join(",") : "0"})`
    );

    const classLevels = [
      ...new Set(enrolledCourses.map((c) => c.class_level).filter(Boolean)),
    ];

    let recommended = [];
    if (classLevels.length) {
      const placeholders = classLevels.map(() => "?").join(",");
      recommended = await query(
        `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
         FROM courses c
         WHERE c.status = 'Active' AND c.class_level IN (${placeholders})
         ORDER BY student_count DESC LIMIT 8`,
        classLevels
      );
    } else {
      recommended = await query(
        `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
         FROM courses c
         WHERE c.status = 'Active'
         ORDER BY student_count DESC LIMIT 8`
      );
    }

    const popular = await query(
      `SELECT c.*, ${STUDENT_COUNT_SQL} AS student_count
       FROM courses c
       WHERE c.status = 'Active'
       ORDER BY student_count DESC LIMIT 8`
    );

    const mapList = (rows) =>
      rows
        .filter((r) => !enrolledIds.has(r.id))
        .slice(0, 5)
        .map((r) => mapCourseRow(r));

    res.json({
      recommended: mapList(recommended),
      popular: mapList(popular),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
};

function mergeWatchedRanges(ranges, duration) {
  const maxDuration = Number(duration);

  const sorted = (Array.isArray(ranges) ? ranges : [])
    .filter(
      (range) =>
        Array.isArray(range) &&
        Number.isFinite(Number(range[0])) &&
        Number.isFinite(Number(range[1])) &&
        Number(range[0]) >= 0 &&
        Number(range[1]) > Number(range[0])
    )
    .map(([start, end]) => [
      Math.max(0, Math.min(maxDuration, Number(start))),
      Math.max(0, Math.min(maxDuration, Number(end))),
    ])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  const merged = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];

    if (!last || range[0] > last[1] + 0.25) {
      merged.push([...range]);
    } else {
      last[1] = Math.max(last[1], range[1]);
    }
  }

  return merged;
}

function getWatchedSeconds(ranges) {
  return ranges.reduce(
    (total, [start, end]) => total + Math.max(0, end - start),
    0
  );
}


exports.getVideoWatchProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await query(
      `SELECT id
       FROM course_enrollments
       WHERE user_id = ?
         AND course_id = ?
         AND status IN ('active', 'completed')
       LIMIT 1`,
      [req.user.id, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({
        message: "Enroll in this course first",
      });
    }

    const rows = await query(
      `SELECT video_id, current_position_seconds,
              duration_seconds, watched_ranges,
              progress_percent, completed
       FROM course_video_watch_progress
       WHERE enrollment_id = ?`,
      [enrollments[0].id]
    );

    res.json({
      videoProgress: rows.map((row) => {
        let watchedRanges = [];

        try {
          watchedRanges = JSON.parse(row.watched_ranges || "[]");
        } catch {
          watchedRanges = [];
        }

        return {
          videoId: Number(row.video_id),
          currentPositionSeconds: Number(row.current_position_seconds) || 0,
          durationSeconds: Number(row.duration_seconds) || 0,
          progressPercent: Number(row.progress_percent) || 0,
          // completed: Boolean(row.completed),
          completed: Number(row.completed) === 1,
          watchedRanges,
        };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load video progress",
    });
  }
};


exports.saveVideoWatchProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const {
      videoId,
      currentPositionSeconds,
      durationSeconds,
      watchedRanges = [],
      completed: videoCompleted = false,
    } = req.body || {};

    const id = Number(videoId);
    const position = Number(currentPositionSeconds);
    const length = Number(durationSeconds);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isFinite(position) ||
      !Number.isFinite(length) ||
      length <= 0 ||
      position < 0 ||
      position > length + 2
    ) {
      return res.status(400).json({
        message: "Valid video progress details are required",
      });
    }

    if (!Array.isArray(watchedRanges)) {
      return res.status(400).json({
        message: "watchedRanges must be an array",
      });
    }

    // Confirm that the video belongs to the requested course.
    const videoRows = await query(
      `SELECT id
       FROM course_videos
       WHERE id = ? AND course_id = ?
       LIMIT 1`,
      [id, courseId]
    );

    if (!videoRows.length) {
      return res.status(404).json({
        message: "Video not found in this course",
      });
    }

    // Confirm that the logged-in student is enrolled.
    const enrollments = await query(
      `SELECT id, started_at
       FROM course_enrollments
       WHERE user_id = ?
         AND course_id = ?
         AND status IN ('active', 'completed')
       LIMIT 1`,
      [req.user.id, courseId]
    );

    if (!enrollments.length) {
      return res.status(403).json({
        message: "Enroll in this course first",
      });
    }

    const enrollmentId = enrollments[0].id;

    const existingRows = await query(
      `SELECT current_position_seconds,
              duration_seconds,
              watched_ranges,
              completed
       FROM course_video_watch_progress
       WHERE enrollment_id = ? AND video_id = ?
       LIMIT 1`,
      [enrollmentId, id]
    );

    const existing = existingRows[0] || null;

    let oldRanges = [];

    try {
      const parsed = JSON.parse(existing?.watched_ranges || "[]");
      oldRanges = Array.isArray(parsed) ? parsed : [];
    } catch {
      oldRanges = [];
    }

    /*
      Keep old watched intervals when the duration is unchanged.
      If the video duration has changed, clamp old intervals to
      the new duration rather than allowing invalid percentages.
    */
    const validOldRanges = mergeWatchedRanges(oldRanges, length);

    const validIncomingRanges = watchedRanges
      .filter(
        (range) =>
          Array.isArray(range) &&
          Number.isFinite(Number(range[0])) &&
          Number.isFinite(Number(range[1])) &&
          Number(range[0]) >= 0 &&
          Number(range[1]) > Number(range[0]) &&
          Number(range[1]) <= length + 2
      )
      .map(([start, end]) => [
        Math.max(0, Number(start)),
        Math.min(length, Number(end)),
      ]);

    // Merge old and new intervals. Rewinding cannot reduce progress.
    const mergedRanges = mergeWatchedRanges(
      [...validOldRanges, ...validIncomingRanges],
      length
    );

    const watchedSeconds = getWatchedSeconds(mergedRanges);

    const progressPercent = Math.min(
      100,
      Math.round((watchedSeconds / length) * 100)
    );

    const furthestWatched = mergedRanges.reduce(
      (furthest, range) => Math.max(furthest, range[1]),
      0
    );

    // Completion is based on actual watched intervals, not a seek.
    const isCompleted =
      Boolean(Number(existing?.completed)) ||
      (
        videoCompleted === true &&
        progressPercent >= 90 &&
        furthestWatched >= length * 0.95
      );

    const safePosition = Math.min(position, length);

    await query(
      `INSERT INTO course_video_watch_progress
        (
          enrollment_id,
          video_id,
          current_position_seconds,
          duration_seconds,
          watched_ranges,
          progress_percent,
          completed
        )
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         current_position_seconds = VALUES(current_position_seconds),
         duration_seconds = VALUES(duration_seconds),
         watched_ranges = VALUES(watched_ranges),
         progress_percent = GREATEST(
           progress_percent,
           VALUES(progress_percent)
         ),
         completed = GREATEST(
           completed,
           VALUES(completed)
         )`,
      [
        enrollmentId,
        id,
        safePosition,
        length,
        JSON.stringify(mergedRanges),
        progressPercent,
        isCompleted ? 1 : 0,
      ]
    );

    if (!enrollments[0].started_at) {
      await query(
        `UPDATE course_enrollments
         SET started_at = NOW()
         WHERE id = ? AND started_at IS NULL`,
        [enrollmentId]
      );
    }

    const progress = await getProgressForEnrollment(
      enrollmentId,
      courseId
    );

    if (progress.courseComplete && !progress.quizDone) {
      await query(
        `UPDATE course_enrollments
         SET completed_at = COALESCE(completed_at, NOW())
         WHERE id = ?`,
        [enrollmentId]
      );
    }

    await syncStudentProfileProgress(req.user.id);

    return res.json({
      video: {
        videoId: id,
        currentPositionSeconds: safePosition,
        durationSeconds: length,
        progressPercent: Math.max(
          progressPercent,
          Number(existing?.progress_percent) || 0
        ),
        completed: isCompleted,
        watchedRanges: mergedRanges,
      },
      progress,
    });
  } catch (err) {
    console.error("saveVideoWatchProgress:", err);

    return res.status(500).json({
      message: "Failed to save video progress",
    });
  }
};

