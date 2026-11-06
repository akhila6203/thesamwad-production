
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BarChart3,
  PlayCircle,
  Users,
  BookOpen,
  Trophy,
  ArrowRight,
} from "lucide-react";
import learningImage from "../../assets/about-samwad1.jpg";

const features = [
  {
    icon: GraduationCap,
    title: "Interactive Learning",
    description: "Engaging and practical content for real-life growth.",
    color: "text-green-700",
    iconBg: "bg-green-100",
    background: "bg-[#F0F8F1]",
    border: "border-green-100",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor learning and development with ease.",
    color: "text-sky-700",
    iconBg: "bg-sky-100",
    background: "bg-[#F0F7FC]",
    border: "border-sky-100",
  },
  {
    icon: PlayCircle,
    title: "Video Lessons",
    description: "High-quality lessons by experienced educators.",
    color: "text-orange-600",
    iconBg: "bg-orange-100",
    background: "bg-[#FFF5EF]",
    border: "border-orange-100",
  },
  {
    icon: Users,
    title: "Parent Support",
    description:
      "Guidance, resources and tools for a stronger home learning environment.",
    color: "text-emerald-700",
    iconBg: "bg-emerald-100",
    background: "bg-[#F0F8F3]",
    border: "border-emerald-100",
  },
];

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Students Learning",
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 dark:bg-[#39483F]",
  },
  {
    icon: BookOpen,
    value: "500+",
    label: "Video Lessons",
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-[#39434F]",
  },
  {
    icon: Users,
    value: "5K+",
    label: "Parents Supported",
    color: "text-orange-600 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-[#504238]",
  },
  {
    icon: Trophy,
    value: "95%",
    label: "Positive Impact",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-[#39483F]",
  },
];

export default function HomeHighlights() {
  return (
    <section className="w-full space-y-10 sm:space-y-12">

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {features.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`${item.background} flex items-center gap-3 rounded-xl border ${item.border} p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.color}`}
              >
                <Icon size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-1 text-base leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-slate-500"
              />
            </div>
          );
        })}

      </div>

      {/* ABOUT SAMWAD */}
      <div className="space-y-7">

        {/* CENTER HEADING */}
        <div className="text-center">

          <p className="text-base font-bold uppercase tracking-[0.18em] text-green-700">
            {/* About Samwad */}
            SAMWAD WITH AJAZ HASHMI
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            A Learning Platform for a{" "}
            <span className="text-sky-700">
              Brighter Tomorrow
            </span>
          </h2>

          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-green-600" />

        </div>

        {/* IMAGE LEFT + CONTENT RIGHT */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-10">

          {/* LEFT IMAGE */}
          <div className="w-full">
            {/* <img
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=85"
              alt="Books and learning"
              className="h-64 w-full rounded-2xl object-cover shadow-sm sm:h-80 lg:h-[350px]"
            /> */}
            <img
  src={learningImage}
  alt="Books and learning"
  className="h-64 w-full rounded-2xl object-cover shadow-sm sm:h-80 lg:h-[350px]"
/>
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full">

            <h3 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
              Empowering Students and Parents Through Meaningful Learning
            </h3>

            <p className="mt-4 text-base leading-8 text-slate-600">
              Samwad with Ajazhashmi is a dedicated learning and
              development platform focused on the holistic growth of
              students. We believe in the power of open communication,
              strong values and modern education to shape confident,
              compassionate and responsible individuals.
            </p>

            <p className="mt-3 text-base leading-8 text-slate-600">
              Our programs support students and parents with practical
              learning, life skills and continuous guidance for a
              brighter, balanced future.
            </p>

            <Link
              to="/about"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-sky-800"
            >
              Know More About Us
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

        {/* STATISTICS BELOW IMAGE AND CONTENT */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`${item.bg} flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-600 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5`}
                // className={`${item.bg} flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5`}
              >

                <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#30343B] ${item.color}`}
                //   className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white ${item.color}`}
                >
                  <Icon size={25} />
                </div>

                <div>
                  {/* <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl"> */}
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                    {item.value}
                  </h3>

                  {/* <p className="mt-1 text-base leading-snug text-slate-600"> */}
                  <p className="mt-1 text-base leading-snug text-slate-600 dark:text-slate-200">
                    {item.label}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
