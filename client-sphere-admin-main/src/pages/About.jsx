
import {
  GraduationCap,
  Users,
  Trophy,
  BookOpen,
  Target,
  Lightbulb,
  ArrowRight,
  Sparkles,
  PlayCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import { PageWithFooter } from "@/components/layout/PageWithFooter";

// Replace the filename with your actual image filename inside src/assets
import aboutImage from "@/assets/about-samwad.jpg";

const stats = [
  {
    value: "10K+",
    label: "Students Learning",
    icon: Users,
    color: "text-[#246B45]",
    bg: "bg-[#EAF4EC]",
  },
  {
    value: "500+",
    label: "Video Lessons",
    icon: PlayCircle,
    color: "text-[#2879B5]",
    bg: "bg-[#EAF3FA]",
  },
  {
    value: "5K+",
    label: "Parents Supported",
    icon: GraduationCap,
    color: "text-[#D97745]",
    bg: "bg-[#FFF1E9]",
  },
  {
    value: "95%",
    label: "Positive Impact",
    icon: Trophy,
    color: "text-[#B58A27]",
    bg: "bg-[#FBF5E5]",
  },
];

const values = [
  {
    icon: BookOpen,
    title: "Practical Learning",
    text: "We make learning meaningful through structured lessons, practical activities, and knowledge that learners can apply with confidence.",
    color: "text-[#246B45]",
    bg: "bg-[#EAF4EC]",
  },
  {
    icon: Users,
    title: "Class-Based Learning",
    text: "Students can explore published classes before login. After login, they can access the courses assigned to their respective class.",
    color: "text-[#2879B5]",
    bg: "bg-[#EAF3FA]",
  },
  {
    icon: Trophy,
    title: "Learning Progress",
    text: "We help learners stay focused with organised lessons, video learning, and progress tracking throughout their learning journey.",
    color: "text-[#D97745]",
    bg: "bg-[#FFF1E9]",
  },
];

export default function About() {
  return (
    <PageWithFooter>
      {/* Top padding prevents content from going behind a fixed header */}
      <main className="bg-background pt-2 sm:pt-4">

        {/* ABOUT PAGE HEADER */}
        <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF4EC] px-4 py-2 text-sm font-semibold text-[#246B45]">
              <Sparkles className="h-4 w-4" />
              {/* About Samwad */}
              SAMWAD WITH AJAZ HASHMI
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-[#246B45] sm:text-4xl md:text-5xl">
              Learning today,
              <span className="text-[#2879B5]"> leading tomorrow.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Empowering students with accessible learning, engaging lessons,
              and the skills they need to build a brighter future.
            </p>
          </div>
        </section>

        {/* ABOUT SAMWAD */}
        <section className="px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 lg:gap-12">

            {/* LEFT IMAGE */}
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-24 w-24 rounded-2xl bg-[#EAF4EC]" />

              <img
                src={aboutImage}
                alt="Students learning with books and study materials"
                className="relative  h-[280px] w-full rounded-2xl object-cover shadow-md sm:h-[350px]"
              />

              <div className="absolute -bottom-4 -right-3 rounded-xl bg-white p-4 shadow-lg sm:right-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4EC]">
                    <GraduationCap className="h-6 w-6 text-[#246B45]" />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-[#246B45]">
                      Learn & Grow
                    </p>
                    <p className="text-xs text-gray-500">
                      Every step matters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="pt-4 md:pt-0">
              <p className="text-sm font-bold uppercase tracking-wider text-[#2879B5]">
                Who We Are
              </p>

              <h2 className="mt-3 text-2xl font-bold leading-snug text-[#246B45] sm:text-3xl">
                A learning platform for a brighter tomorrow
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Samwad is designed to make learning simple, engaging, and
                accessible. We bring structured educational content and
                technology together to create a better learning experience
                for students.
              </p>

              <p className="mt-3 text-base leading-7 text-muted-foreground">
                From exploring available classes to watching lessons and
                tracking learning progress, Samwad gives students a clear
                path to learn at their own pace and build their knowledge
                step by step.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF4EC]">
                    <Target className="h-4 w-4 text-[#246B45]" />
                  </div>

                  <p className="text-sm leading-6 text-foreground">
                    Structured courses designed around student learning needs.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF3FA]">
                    <Lightbulb className="h-4 w-4 text-[#2879B5]" />
                  </div>

                  <p className="text-sm leading-6 text-foreground">
                    Engaging video lessons and a practical learning approach.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF1E9]">
                    <GraduationCap className="h-4 w-4 text-[#D97745]" />
                  </div>

                  <p className="text-sm leading-6 text-foreground">
                    A learning experience that supports continuous progress.
                  </p>
                </div>
              </div>

              <Link
                to="/classes"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#27834B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1E6338]"
              >
                Explore Classes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* STATISTICS - NO BACKGROUND COLOR */}
        <section className="bg-transparent px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-[#2879B5]">
                Our Impact
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#246B45] sm:text-3xl">
                Learning that makes a difference
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Every lesson and every learning milestone contributes to
                building a stronger learning community.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>

                    <p className="mt-4 text-2xl font-bold text-[#246B45] sm:text-3xl">
                      {item.value}
                    </p>

                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* OUR MISSION */}
        <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-2xl bg-[#EAF4EC] dark:bg-[#343E3A] px-6 py-9 sm:px-10 sm:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <Target className="h-6 w-6 text-[#246B45]" />
              </div>

              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-[#2879B5]">
                Our Mission
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#246B45] sm:text-3xl">
                Making quality learning accessible to everyone
              </h2>

              <p className="mt-4 text-base leading-7 text-gray-600">
                Our mission is to create a supportive digital learning
                environment where students can discover knowledge, develop
                practical skills, follow their progress, and move confidently
                towards their goals.
              </p>
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-[#2879B5]">
                What Makes Us Different
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#246B45] sm:text-3xl">
                What we believe in
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                We focus on creating a learning experience that is structured,
                student-friendly, and focused on meaningful outcomes.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {values.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#246B45]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>
    </PageWithFooter>
  );
}




// import { GraduationCap, Users, Trophy, Sparkles } from "lucide-react";
// import { PageWithFooter } from "@/components/layout/PageWithFooter";

// const stats = [
//   { label: "Active Learners", value: "50K+" },
//   { label: "Published Courses", value: "100+" },
//   // { label: "Expert Mentors", value: "120+" },
//   { label: "Courses", value: "200+" },
//   { label: "Completion Rate", value: "93%" },
// ];

// const values = [
//   {
//     icon: GraduationCap,
//     title: "Practical Learning",
//     text: "We focus on hands-on skills that learners can use immediately in real projects.",
//   },
//   {
//     icon: Users,
//     title: "Class-Based Learning",
//     text: "Learners can browse all published classes before login, and after login they see only the courses assigned to their class.",
//   },
//   // {
//   //   icon: Users,
//   //   title: "Mentor Support",
//   //   text: "Every learner gets guidance through structured content and responsive support.",
//   // },
//   {
//     icon: Trophy,
//     title: "Career Outcomes",
//     text: "Our goal is simple: help learners become job-ready with confidence.",
//   },
// ];

// export default function About() {
//   return (
//     <PageWithFooter>
//     <div className="bg-background px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
//       <div className="mx-auto max-w-6xl space-y-10">
//         <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-14 text-white shadow-xl">
//           <div className="max-w-3xl">
//             <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
//               <Sparkles className="h-4 w-4" /> About LMS
//             </p>
//             <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">Building better careers through focused learning.</h1>
//             <p className="mt-4 text-sm text-white/90">
//               LMS helps students and professionals gain modern skills through structured content, guided practice,
//               and measurable progress.
//             </p>
//           </div>
//         </section>

//         <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
//           {stats.map((item) => (
//             <div key={item.label} className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
//               <p className="text-3xl font-bold text-foreground">{item.value}</p>
//               <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
//             </div>
//           ))}
//         </section>

//         <section className="rounded-3xl border bg-card p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold">Our mission</h2>
//           <p className="mt-3 text-sm leading-6 text-muted-foreground">
//             We are creating a learning platform that blends industry-level content with smooth product experience.
//             From beginner to advanced level, we want every learner to discover, practice, and apply knowledge with
//             confidence.
//           </p>
//         </section>

//         <section className="grid gap-5 md:grid-cols-3">
//           {values.map((item) => {
//             const Icon = item.icon;   // ✅ ADD THIS LINE

//             return (
//               <div key={item.title} className="rounded-2xl border bg-card p-6 shadow-sm">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
//                   <Icon className="h-5 w-5" />   {/* ✅ CHANGE HERE */}
//                 </div>
//                 <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
//                 <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
//               </div>
//             );
//           })}
//         </section>
//       </div>
//     </div>
//     </PageWithFooter>
//   );
// }

