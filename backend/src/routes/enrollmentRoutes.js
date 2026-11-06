const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/authMiddleware");
const {
  getMyCourses,
  markLessonProgress,
  completeQuiz,
  deleteEnrollment,
  getRecommended,
   getVideoWatchProgress,
  saveVideoWatchProgress,
  
} = require("../controllers/enrollmentController");


router.get("/my-classes", verifyUser, getMyCourses);
router.get("/my-courses", verifyUser, getMyCourses);
router.get("/recommended", verifyUser, getRecommended);
router.post("/classes/:courseId/progress", verifyUser, markLessonProgress);
router.post("/classes/:courseId/quiz-complete", verifyUser, completeQuiz);
router.delete("/classes/:courseId", verifyUser, deleteEnrollment);
router.post("/courses/:courseId/progress", verifyUser, markLessonProgress);
router.post("/courses/:courseId/quiz-complete", verifyUser, completeQuiz);
router.delete("/courses/:courseId", verifyUser, deleteEnrollment);

router.get(
  "/classes/:courseId/video-progress",
  verifyUser,
  getVideoWatchProgress
);

router.post(
  "/classes/:courseId/video-progress",
  verifyUser,
  saveVideoWatchProgress
);

module.exports = router;
