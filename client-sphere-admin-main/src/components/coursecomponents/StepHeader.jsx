
const steps = [
  "Class Info",
  "Videos",
  "Materials",
  "Quiz",
  "Preview",
  "Publish",
];

export default function StepHeader({ step }) {
  return (
    <div className="mb-3 w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm sm:p-3 lg:p-4">
      {/* Mobile: horizontal scroll; tablet and desktop: full stepper */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-2 sm:pb-0">
        <div className="flex min-w-[570px] items-start sm:min-w-0">
          {steps.map((label, i) => {
            const s = i + 1;
            const completed = step > s;
            const active = step === s;

            return (
              <div
                key={s}
                className="flex min-w-0 flex-1 items-start"
              >
                <div className="flex w-[76px] shrink-0 flex-col items-center sm:w-full">
                  <div
                    className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition sm:h-9 sm:w-9 sm:text-sm ${
                      active
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : completed
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>

                  <span
                    className={`mt-2 w-full text-center text-[10px] leading-tight sm:text-xs ${
                      active
                        ? "font-semibold text-blue-600"
                        : completed
                        ? "font-medium text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {i !== steps.length - 1 && (
                  <div
                    className={`mt-4 h-[2px] min-w-3 flex-1 sm:mt-[18px] ${
                      completed ? "bg-green-600" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// const steps = [
//   "Class Info",
//   "Videos",
//   "Materials",
//   "Quiz",
//   "Preview",
//   "Publish",
// ];

// export default function StepHeader({ step }) {
//   return (
//     <div className="bg-gray-50 p-4 rounded-xl shadow mb-3">

//       {/* <h2 className="text-xl font-bold mb-6">Create Course</h2> */}

//       <div className="flex items-center">

//         {steps.map((label, i) => {
//           const s = i + 1;

//           return (
//             <div key={s} className="flex items-center flex-1">

//   {/* CIRCLE */}
//   <div className="flex flex-col items-center min-w-[80px]">

//     <div
//       className={`w-10 h-10 flex items-center justify-center rounded-full z-10
//       ${
//         step === s
//           ? "bg-blue-600 text-white"
//           : "bg-gray-300"
//       }`}
//     >
//       {s}
//     </div>

//     <span className="text-xs mt-2">{label}</span>
//   </div>

//   {/* LINE */}
//   {i !== steps.length - 1 && (
//     <div className="flex-1 h-[2px] bg-gray-300 relative top-[-10px]">
//       <div
//         className={`h-full ${
//           step > s ? "bg-blue-600" : ""
//         }`}
//       />
//     </div>
//   )}

// </div>
//           );
//         })}

//       </div>

//     </div>
//   );
// }

