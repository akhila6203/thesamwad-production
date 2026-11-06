import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  BookOpen,
  Award,
  Check,
  FileText,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import VideoPlayer from "@/pages/user/VideoPlayer";
import { learnerClassService } from "@/services/learnerClassService";
import { mapLearnerCourseDetail } from "@/utils/mapLearnerCourse";
import { QuizRunner, sampleQuiz } from "@/pages/user/QuizRunner";

import { enrollmentService } from "@/services/enrollmentService";


import { PageWithFooter } from "@/components/layout/PageWithFooter";

export default function CourseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("Module knowledge check");
  const [quizQuestions, setQuizQuestions] = useState(sampleQuiz);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [progressInfo, setProgressInfo] = useState(null);

  const [videoProgress, setVideoProgress] = useState({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await learnerClassService.getById(id);
        if (cancelled) return;
        const mapped = mapLearnerCourseDetail(res.data.course);
        
        setCourse(mapped);
        const firstPlayable = mapped.videos?.find((v) => v.free && v.url) || mapped.videos?.[0];
        
        
//         setActive(
//   firstPlayable
//     ? {
//         id: firstPlayable.id,
//         index: mapped.videos.indexOf(firstPlayable),
//         title: firstPlayable.title,
//         duration: firstPlayable.duration,
//         url: firstPlayable.url,
//         resumeAt: 0,
//         watchedRanges: [],
//         completed: false,
//       }
//     : null
// );
setActive(
  firstPlayable
    ? {
        id: firstPlayable.id ?? firstPlayable.videoId ?? firstPlayable.video_id,
        databaseVideoId:
          firstPlayable.databaseVideoId ??
          firstPlayable.database_video_id ??
          firstPlayable.id ??
          firstPlayable.videoId ??
          firstPlayable.video_id,
        index: mapped.videos.indexOf(firstPlayable),
        title: firstPlayable.title,
        duration: firstPlayable.duration,
        url: firstPlayable.url,
        resumeAt: 0,
        watchedRanges: [],
        completed: false,
      }
    : null
);

        if (mapped.enrolled) {
          enrollmentService.getMyClasses()
  .then((myRes) => {
    const row = (myRes.data.courses || []).find(
      (c) => String(c.courseId) === String(mapped.id)
    );

    if (row) {
      setProgressInfo({
        percent: Number(row.progressPercent) || 0,
        courseComplete: Boolean(row.courseComplete),
        quizDone: Boolean(row.quizDone),
      });
    }
  })
  .catch((err) => {
    console.error("Unable to load saved course progress:", err);
  });
          
          enrollmentService.getVideoProgress(mapped.id)
  .then((res) => {
  const progressMap = {};

  (res.data.videoProgress || []).forEach((item) => {
    progressMap[item.videoId] = item;
  });

  setVideoProgress(progressMap);

setActive((previous) => {
  if (!previous) return previous;

  // const saved = progressMap[previous.id];
  const saved = progressMap[previous.databaseVideoId ?? previous.id];

  return {
    ...previous,
    resumeAt: Number(saved?.currentPositionSeconds || 0),
    watchedRanges: saved?.watchedRanges || [],
    completed: Boolean(saved?.completed),
  };
});
}).catch((err) => {
    console.error("Unable to load video progress:", err);
  });

        }
      } catch {
        if (!cancelled) setCourse(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Loading course…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">class not found</h2>
        <Button onClick={() => navigate("/classes")} className="mt-4">
          Back to classes
        </Button>
      </div>
    );
  }

  const defaultMaterials = [
    { title: "Module 1 reference.pdf", type: "PDF", url: "https://example.com/material-1" },
    { title: "Module 2 cheatsheet.pdf", type: "PDF", url: "https://example.com/material-2" },
  ];
  const defaultQuizzes = [
    { quizTitle: "Module 1 Quiz", questions: sampleQuiz },
    { quizTitle: "Module 2 Quiz", questions: sampleQuiz },
  ];
  const from = location.state?.from || "/dashboard";
  const backLabel = from.includes("development")
    ? "Back to development"
    : from.includes("courses")
      ? "Back to classes"
      : "Back to home";

  // const lessonCount = course.videos?.length || fakeLessons.length;
  const lessonCount = course.videos?.length || 0;
  const progress = progressInfo?.percent ?? 0;
  const enrolled = course.enrolled;

  const allVideosCompleted =
  Boolean(enrolled) &&
  lessonCount > 0 &&
  course.videos.every((video) => {
    const videoId =
      video.databaseVideoId ??
      video.database_video_id ??
      video.id ??
      video.videoId ??
      video.video_id;

    return Boolean(
      videoProgress[videoId]?.completed || video.done
    );
  });

 const playLesson = (lesson, index) => {
  if (lesson.locked || !lesson.url) {
    toast.info("This lesson is locked or its video URL is missing.");
    return;
  }

  // const lessonId =
  //   lesson.id ??
  //   lesson.videoId ??
  //   lesson.video_id ??
  //   lesson.databaseVideoId ??
  //   lesson.database_video_id;
  const lessonId =
  lesson.databaseVideoId ??
  lesson.database_video_id ??
  lesson.id ??
  lesson.videoId ??
  lesson.video_id;

  const progressKey = lessonId ?? `v${index + 1}`;
  const saved = videoProgress[progressKey];

  setActive({
    id: progressKey,
    databaseVideoId: lessonId,
    index,
    title: lesson.title || `Lesson ${index + 1}`,
    duration: lesson.duration || "0:00",
    url: lesson.url,
    resumeAt: Number(saved?.currentPositionSeconds || 0),
    watchedRanges: saved?.watchedRanges || [],
    completed: Boolean(saved?.completed),
  });
};


  const startQuiz = (qz, i) => {
  if (!enrolled) {
    toast.info("Enroll to access quizzes");
    return;
  }

  if (!allVideosCompleted) {
    toast.info("Complete all lessons before starting the quiz");
    return;
  }

  setQuizTitle(qz.quizTitle || `Quiz ${i + 1}`);
  setActiveQuizId(qz.id ?? null);
  setQuizQuestions(
    qz.questions?.length ? qz.questions : sampleQuiz
  );
  setQuizOpen(true);
};

  return (
    <PageWithFooter variant="user">
    <div className="space-y-5 sm:space-y-6 py-1 sm:py-4">

      <Button variant="ghost" size="sm" onClick={() => navigate(from)}>
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Button>
      <p className="text-sm text-muted-foreground">
          Home / {course.category} / {course.title}
        </p>

       <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[1.3fr_1fr]">

        {/* LEFT */}
        <div className="space-y-5">

          <Card className="overflow-hidden border-border/60 p-0 shadow-sm border border-border">
            {/* <VideoPlayer
              key={active?.id}
              src={active?.url}
              poster={course.thumbnail || course.cover}
              title={active?.title}
              subtitle={active?.duration}
            /> */}
            <VideoPlayer
  key={active?.id}
  src={active?.url}
  poster={course.thumbnail || course.cover}
  title={active?.title}
  subtitle={active?.duration}
  initialTime={active?.resumeAt || 0}
  initialWatchedRanges={active?.watchedRanges || []}
  // trackProgress={Boolean(enrolled && active?.id)}
  trackProgress={
  Boolean(enrolled && /^\d+$/.test(String(active?.databaseVideoId ?? "")))
}
  
  onWatchProgress={async (watchData) => {
  if (
    !enrolled ||
    !/^\d+$/.test(String(active?.databaseVideoId ?? ""))
  ) {
    throw new Error("Invalid video ID or enrollment");
  }

  const res = await enrollmentService.saveVideoProgress(course.id, {
    videoId: Number(active.databaseVideoId),
    currentPositionSeconds: watchData.currentPositionSeconds,
    durationSeconds: watchData.durationSeconds,
    watchedRanges: watchData.watchedRanges,
    completed: watchData.completed,
  });

  const saved = res.data.video;

  if (!saved) {
    throw new Error("Video progress was not returned by the server");
  }

  setVideoProgress((previous) => ({
    ...previous,
    [active.databaseVideoId]: {
      ...previous[active.databaseVideoId],
      ...saved,
      watchedRanges: saved.watchedRanges || [],
    },
  }));
  if (saved.completed) {
  toast.success("Lesson completed!");
}

  // Refresh the overall course progress from the backend.
  if (res.data.progress) {
    setProgressInfo({
      percent: Number(res.data.progress.percent) || 0,
      courseComplete: Boolean(res.data.progress.courseComplete),
      quizDone: Boolean(res.data.progress.quizDone),
    });
  }

  return saved;
}}

onComplete={() => {
  if (!enrolled || !active?.databaseVideoId) return;

  const saved = videoProgress[active.databaseVideoId];

  if (saved?.completed) {
    toast.success("Lesson completed!");
  }
}}
//       onComplete={() => {
//   if (!enrolled || !active?.databaseVideoId) return;

//   setVideoProgress((previous) => ({
//     ...previous,
//     [active.databaseVideoId]: {
//       ...previous[active.databaseVideoId],
//       completed: true,
//       progressPercent: 100,
//     },
//   }));

//   toast.success("Lesson completed!");
// }}
      
  
/>
          </Card>

          <div className="rounded-xl p-6  ">
  
  {/* CLASS + SUBJECT */}
  <div className="flex flex-wrap items-center gap-2 mb-2">
    <span className="bg-gray-200 text-xs px-2 py-1 rounded">
      {course.category || course.classLevel}
    </span>
    {(course.subCategory || course.subject) && (
      <span className="bg-blue-100 text-[#2879B5] text-xs px-2 py-1 rounded">
        {course.subCategory || course.subject}
      </span>
    )}
  </div>

  {/* TITLE */}
  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
    {course.title}
  </h1>

  {/* DESCRIPTION */}
  <p className="mt-2 text-sm text-gray-500 max-w-xl sm:max-w-4xl">
    {course.description}
  </p>

  {/* STATS */}
  <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
    
    {/* <span className="flex items-center gap-1">
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      {course.rating} ({(course.reviews || 0).toLocaleString()})
    </span> */}

    <span className="flex items-center gap-1">
      <Clock className="h-4 w-4" />
      {course.hours}h
    </span>

    <span className="flex items-center gap-1">
      <BookOpen className="h-4 w-4" />
      {course.lessons} lessons
    </span>

    <span className="text-gray-500">
      By <span className="font-medium text-gray-900">
        {course.instructor}
      </span>
    </span>

  </div>
</div>

          {/* TABS */}
          <Tabs defaultValue="overview">
            <TabsList className="flex h-auto w-full justify-start rounded-xl bg-muted p-1 shadow-sm overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="materials"className="rounded-lg text-xs sm:text-sm whitespace-nowrap">Materials</TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">Quizzes</TabsTrigger>
              {/* <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-6 shadow-sm border border-border">
                <h3 className="font-semibold">What you'll learn</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {(course.overview?.length ? course.overview : ["No overview added"]).map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {b}
                    </li>
                  ))}
                  
                </ul>
              </Card>
              
            </TabsContent>

            <TabsContent value="materials">
              {(course.materials?.length ? course.materials : defaultMaterials).map((m, i) => (
                <Card key={i} className="flex items-center justify-between p-4 shadow-sm border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#2879B5] " />
                    <div>
                      <p className="text-sm font-medium">{m.title || m.name || `Material ${i + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{m.type || "FILE"}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    
                    onClick={async () => {
  if (m.locked || !enrolled) {
    toast.info("Sign in and enroll to open materials");
    return;
  }

  if (!allVideosCompleted) {
    toast.info("Complete all lessons before opening materials");
    return;
  }

  if (!m.url) return;

  const newTab = window.open("about:blank", "_blank");

  try {
    const materialKey = `material:${m.id || i + 1}`;

    const res = await enrollmentService.saveProgress(
      course.id,
      materialKey,
      "material"
    );

    setProgressInfo(res.data.progress);
    if (newTab) {
      newTab.location.href = m.url;
    } else {
      window.location.href = m.url;
    }
  } catch (err) {
    newTab?.close();
    toast.error(
      err.response?.data?.message || "Unable to save material progress"
    );
  }
}}

                    // disabled={!m.url && !m.locked}
                    disabled={Boolean(
  m.locked || !allVideosCompleted || !m.url
)}
                  >
                    {/* {m.locked ? "Locked" : "Open"} */}
                    {m.locked
  ? "Locked"
  : !allVideosCompleted
    ? "Complete lessons"
    : "Open"}
                  </Button>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="quizzes">
              {(course.quizzes?.length ? course.quizzes : defaultQuizzes).map((qz, i) => (
                <Card key={i} className="flex justify-between p-4 shadow-sm border border-border">
                  <div>
                    <p className="text-sm font-medium">{qz.quizTitle || `Quiz ${i + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {(qz.questions?.length || 0)} questions
                    </p>
                  </div>
                  {/* <Button onClick={() => startQuiz(qz, i)} disabled={qz.locked}>
                    {qz.locked ? "Locked" : "Start"}
                  </Button> */}
                  <Button
  onClick={() => startQuiz(qz, i)}
  disabled={Boolean(qz.locked || !allVideosCompleted)}
>
  {qz.locked
    ? "Locked"
    : !allVideosCompleted
      ? "Complete lessons"
      : "Start"}
</Button>
                </Card>
              ))}
              </TabsContent>

          </Tabs>

        </div>

        {/* RIGHT */}
        <aside className="space-y-4 mt-4 lg:mt-0">

          <Card className="p-5 shadow-sm border border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Your progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>

            <Progress value={progress} />

            <p className="mt-2 text-xs text-muted-foreground">
              {progress}% complete
            </p>
            {!enrolled && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Sign in with your registered Gmail to access all lessons.
                </p>
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-[#2879B5] to-[#7fa5c3]"
                  onClick={() => {
                    const firstFree = course.videos?.find((v) => v.free && !v.locked);
                    if (firstFree) {
                      playLesson(firstFree, course.videos.indexOf(firstFree));
                    } else {
                      toast.info("Start with the preview lessons in the list.");
                    }
                  }}
                >
                  Continue learning
                </Button>
              </div>
            )}
            {enrolled && (
              <Button
                className="mt-3 w-full rounded-full bg-gradient-to-r from-[#2879B5] to-[#8dadc5]"
                onClick={() => {
                  const next = course.videos?.find((v) => !v.locked && v.url);
                  if (next) playLesson(next, course.videos.indexOf(next));
                }}
              >
                Continue learning
              </Button>
            )}
          </Card>

          <Card className="overflow-hidden p-0 shadow-sm border border-border">
  {(course.videos || []).map((l, i) => {
    const videoId =
      l.databaseVideoId ??
      l.database_video_id ??
      l.id ??
      l.videoId ??
      l.video_id;

    const savedProgress = videoProgress[videoId];

    return (
      <button
        key={videoId ?? i}
        type="button"
        onClick={() => playLesson(l, i)}
        className="flex items-center justify-between w-full border-b px-3 sm:px-4 py-3 text-left text-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100">
            {l.locked ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : (
              <Play className="w-4 h-4 text-[#2879B5] " />
            )}
          </div>

          <div className="text-left">
            <p className="text-xs sm:text-sm font-medium">
              {l.title || `Lesson ${i + 1}`}
            </p>

            <p className="text-xs text-muted-foreground">
              {l.duration || "0:00"}

              {enrolled && savedProgress && (
                <span className="ml-2 text-[#2879B5] ">
                  {savedProgress.completed
                    ? "Completed"
                    : `${savedProgress.progressPercent || 0}% watched`}
                </span>
              )}
            </p>
          </div>
        </div>

        {(savedProgress?.completed || l.done) && (
          <Check className="w-4 h-4 text-green-500" />
        )}
      </button>
    );
  })}
</Card>

            {/* <Card className="p-6 shadow-sm border border-border">
  <div className="flex items-center gap-3">
    <Award className="w-6 h-6 text-purple-600" />
    <div>
      <p className="font-semibold text-sm">Earn a certificate</p>
      <p className="text-xs text-muted-foreground">
        Complete the course and get a certificate
      </p>
    </div>
  </div>
</Card> */}

        </aside>

      </div>

      <QuizRunner
        open={quizOpen}
        onOpenChange={setQuizOpen}
        title={quizTitle}
        questions={quizQuestions}
        onComplete={async ({ score, total }) => {
          try {
            await enrollmentService.completeQuiz(course.id, {
              score,
              total,
              quizId: activeQuizId,
            });
            toast.success(`Quiz submitted! Score: ${score}/${total}`);
            const myRes = await enrollmentService.getMyClasses();
            const row = (myRes.data.courses || []).find(
              (c) => String(c.courseId) === String(course.id)
            );
            if (row) {
              setProgressInfo({
                percent: row.progressPercent,
                courseComplete: row.courseComplete,
                quizDone: row.quizDone,
              });
            }
          } catch (err) {
            toast.error(
              err.response?.data?.message ||
                "Complete all lessons and materials before the quiz."
            );
          }
        }}
      />
    </div>
    </PageWithFooter>
  );
}




