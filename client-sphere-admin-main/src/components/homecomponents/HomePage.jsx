import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Sparkles,
  Star,
  Award,
  Users,
  BookOpen,
  Zap,
  Shield,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { homeVideoService } from "@/services/homeVideoService";

import { CourseCard } from "../../pages/user/CourseCard";
import VideoPlayer from "../../pages/user/VideoPlayer";
import { usePublishedCourses } from "@/hooks/usePublishedCourses";
import { getSessionUser } from "@/utils/authSession";
import { filterCoursesByStudentClass } from "@/utils/classFilter";
import { filterCoursesWithLessons } from "@/utils/courseFilters";

import demo from "../../assets/videos/demo.mp4";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import HomeHighlights from "./HomeHighlights";

// const features = [
//   { icon: Award, title: "Certified courses", desc: "Industry-recognized certificates upon completion." },
//   { icon: Users, title: "Mentor support", desc: "Direct access to instructors and community." },
//   { icon: Zap, title: "Hands-on projects", desc: "Ship real work — not just theory." },
//   { icon: Shield, title: "Lifetime access", desc: "Buy once, learn forever." },
// ];

const HOME_PREVIEW_COUNT = 12;

export default function HomePage() {
  const { courses, loading, error } = usePublishedCourses();
  const sessionUser = getSessionUser();
  const isLoggedIn = sessionUser && sessionUser.role !== "admin";

  const visiblePool = useMemo(() => {
    let list = filterCoursesWithLessons(courses);
    if (isLoggedIn) {
      list = filterCoursesByStudentClass(list, sessionUser);
    }
    return list;
  }, [courses, isLoggedIn, sessionUser]);
  const visibleCourses = visiblePool.slice(0, HOME_PREVIEW_COUNT);
  const heroCourse = visiblePool[0] || courses[0];

  const [demoVideo, setDemoVideo] = useState(null);

    useEffect(() => {
      homeVideoService
        .getPublic()
        .then((res) => setDemoVideo(res.data.video))
        .catch(() => setDemoVideo(null));
    }, []);

  return (
    <PageWithFooter>
    <div className="bg-background text-foreground">
      <HomeHighlights />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#F0F8F1] via-white to-[#EFF7FC] dark:from-[#30343B] dark:via-[#292D33] dark:to-[#30343B]" />
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 pt-8 pb-6 sm:pt-10 sm:pb-8">
{/* <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pt-8 pb-3 sm:pt-10 sm:pb-4 lg:pt-12 lg:pb-4"> */}
        {/* <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-12 sm:py-16 lg:py-20"> */}
          <div className="flex flex-col items-start gap-5 sm:gap-6">

  {/* BADGE */}
  <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF5EC] px-4 py-2 text-base font-medium text-[#246B45]">
    <Sparkles className="w-5 h-5 text-[#27834B]" />
    New: AI for Builders course is live
  </div>

  {/* HEADING */}
  {/* <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] text-[#246B45]"> */}
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] text-[#246B45] dark:text-[#8ED3A5]">
    Learning today,
    <br />
    <span className="text-[#2879B5]">
      leading tomorrow.
    </span>
  </h1>

  {/* DESCRIPTION */}
  <p className="max-w-xl text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-200">
    Mentor-led courses with real projects in web development,
    data science, design, AI and cloud.
  </p>

  {/* BUTTONS */}
  <div className="flex flex-wrap items-center gap-3 sm:gap-4">

    <a
      href="#classes"
      className="bg-[#27834B] hover:bg-[#1E6338] text-white px-6 py-3 rounded-lg flex items-center gap-2 text-base font-semibold transition"
    >
      Browse classes
      <ChevronRight className="w-5 h-5" />
    </a>

    {!isLoggedIn && (
      <Link
        to="/login"
        className="rounded-lg border border-[#2879B5] px-6 py-3 text-base font-semibold text-[#2879B5] transition hover:bg-[#2879B5] hover:text-white"
      >
        Sign in
      </Link>
    )}

  </div>

  {/* LEARNERS AND RATING */}
  <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-2">

    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {["bg-[#27834B]", "bg-[#2879B5]", "bg-[#E66A50]", "bg-[#D9A441]"].map((c, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 border-white ${c}`}
          />
        ))}
      </div>

      <span className="text-base font-medium text-slate-700 dark:text-slate-200">
        50,000+ learners
      </span>
    </div>

    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-4 h-4 text-yellow-500 fill-yellow-500"
        />
      ))}

     <span className="ml-1 text-base font-semibold text-slate-700 dark:text-slate-200">
        4.8
      </span>
    </div>

  </div>

</div>

          <div className="mt-8 lg:mt-0">
            <div className="rounded-2xl bg-card p-3 sm:p-4 shadow-xl">
              <VideoPlayer
                  src={demoVideo?.video_url || demo}
                  controls
                  autoPlay
                  muted
                  loop
                  poster={heroCourse?.thumbnail}
                  title={heroCourse?.title || "Course preview"}
                  subtitle={
                    heroCourse
                      ? `${heroCourse.topics ?? heroCourse.lessons ?? 0} topics · ${heroCourse.hours || 0}h`
                      : "Explore our catalog"
                  }
                />

              <div className="hidden sm:grid grid-cols-3 gap-3 mt-4">
                  {courses.slice(1, 4).map((c) => (
                    <Link
                      key={c.id}
                      to={`/classes/${c.id}`}
                      className="block bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition"
                    >
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="h-16 w-full object-cover"
                        />
                      ) : (
                        <div className={`h-16 bg-gradient-to-br ${c.cover}`} />
                      )}

                      <div className="p-2">
                        <p className="text-xs line-clamp-2">{c.title}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {c.rating}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
             
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      {/* <section className="border-y bg-secondary/40 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow">
                <f.icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* COURSES */}
      {/* <section id="classes" className="max-w-7xl mx-auto py-12 sm:py-16"> */}
      {/* <section id="classes" className="max-w-7xl mx-auto pt-8 pb-8 sm:pt-10 sm:pb-10"> */}
      <section
  id="classes"
  className="max-w-7xl mx-auto pt-4 pb-10 sm:pt-5 sm:pb-12 px-4 sm:px-6 lg:px-0"
>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-[#181f20] dark:text-slate-100">
  Skills to transform your career
</h2>

<p className="mt-3 max-w-3xl text-base sm:text-lg leading-7 text-slate-600 dark:text-slate-200">
  Learn in-demand skills through expert-led classes, real-world
  projects, and industry-focused training.
</p>
            {/* <h2 className="text-3xl font-bold">Skills to transform your career</h2>
            <p className="mt-2 text-muted-foreground">
              Learn in-demand skills through expert-led classes, real-world projects, and industry-focused training.
            </p> */}
          </div>
        </div>

        <div className="mt-6">
          {!loading && visiblePool.length > 0 && (
            // <p className="text-sm text-muted-foreground">
            <p className="text-base text-slate-600">
              {visiblePool.length} published lesson{visiblePool.length !== 1 ? "s" : ""} · topics shown on each card
            </p>
          )}
        </div>

        {loading && (
          <p className="mt-8 text-center text-muted-foreground">Loading classes…</p>
        )}

        {error && !loading && (
          <p className="mt-8 text-center text-red-500 text-sm">
            Could not load classes. Make sure the backend is running.
          </p>
        )}

        {!loading && !error && visiblePool.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            No published classes yet.
          </p>
        )}

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 mt-6">
          {visibleCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {visiblePool.length > HOME_PREVIEW_COUNT && (
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full px-8"
            >
              <Link to="/homeclasses">More</Link>
            </Button>
          </div>
        )}
      </section>

      {/* <section className="mx-auto max-w-7xl py-16"> */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="rounded-2xl px-6 py-10 sm:px-8 sm:py-12 text-center text-white bg-gradient-to-r from-[#27834B] via-[#2879B5] to-[#E66A50] shadow-lg">
        {/* <div className="rounded-2xl px-8 py-14 text-center text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 shadow-xl"> */}
          <BookOpen className="mx-auto h-10 w-10 opacity-90" />
          <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
            Start your learning journey today
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">
            Join 50,000+ learners building skills that matter — with mentor-led courses and real-world projects.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="bg-white text-[#2879B5]  px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
              >
                Get started free
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
    </PageWithFooter>
  );
}
