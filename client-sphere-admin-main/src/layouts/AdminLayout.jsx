
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/AppSidebar";
import { TopHeader } from "@/components/TopHeader";
import { getSessionUser } from "@/utils/authSession";

export default function AdminLayout({ children }) {
  const session = getSessionUser();
  const isAdmin = session?.role === "admin";

  const [screenWidth, setScreenWidth] = useState(
    () => window.innerWidth
  );

  const [collapsed, setCollapsed] = useState(
    () => isAdmin && window.innerWidth < 1024
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setScreenWidth(width);

      if (isAdmin) {
        setCollapsed(width < 1024);
      }

      if (width >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isAdmin]);

  const sidebarWidth = isAdmin
    ? isMobile
      ? "0px"
      : isTablet || collapsed
        ? "68px"
        : "220px"
    : collapsed
      ? "68px"
      : "220px";

  return (
    <div
      className={`flex h-screen w-full overflow-hidden bg-background ${
        isAdmin ? "admin-responsive-layout" : ""
      }`}
    >
      <AppSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className="flex min-w-0 flex-1 flex-col h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
        }}
      >
        {/* HEADER */}
        <div
          className="fixed top-0 right-0 h-16 z-50 bg-card/95 border-b border-border shadow-sm transition-all duration-300"
          style={{
            left: sidebarWidth,
          }}
        >
          <TopHeader
            collapsed={collapsed}
            onMenuClick={() => setMobileOpen(true)}
            showMobileMenu={isAdmin && isMobile}
          />
        </div>

        {/* CONTENT */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="min-h-full w-full px-3 pb-4 pt-20 sm:px-4 sm:pb-6 lg:px-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { Outlet } from "react-router-dom";
// import { AppSidebar } from "@/components/AppSidebar";
// import { TopHeader } from "@/components/TopHeader";

// export default function AdminLayout({ children }) {
//   const [collapsed, setCollapsed] = useState(
//     () => typeof window !== "undefined" && window.innerWidth < 768
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       setCollapsed(window.innerWidth < 768);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-background">

//       {/* SIDEBAR */}
//       <AppSidebar
//         collapsed={collapsed}
//         setCollapsed={setCollapsed}
//       />

//       {/* RIGHT SIDE */}
//       <div
//         className={`ml-[68px] flex min-w-0 flex-1 flex-col h-screen transition-all duration-300 md:ml-0`}
//         style={{
//           marginLeft: collapsed ? "68px" : "220px",
//         }}
//       >

//         {/* HEADER */}
//         <div
//           className="fixed top-0 right-0 h-16 z-50 bg-card/95 border-b border-border shadow-sm transition-all duration-300"
//           style={{
//             left: collapsed ? "68px" : "220px",
//           }}
//         >
//           <TopHeader collapsed={collapsed} />
//         </div>

//         {/* PAGE CONTENT */}
//         <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
//           <div className="min-h-full w-full px-3 pb-4 pt-20 sm:px-4 sm:pb-6 lg:px-6">
//             {children ?? <Outlet />}
//           </div>
//         </main>

//       </div>
//     </div>
//   );
// }



// // layouts/AdminLayout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { AppSidebar } from "@/components/AppSidebar";
// import { TopHeader } from "@/components/TopHeader";

// export default function AdminLayout({ children }) {

//   const [collapsed, setCollapsed] = useState(false);
  
//   return (
//     <div className="flex h-screen w-full bg-background">

//       {/* SIDEBAR */}
//       <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//       {/* RIGHT SIDE */}
//       <div
//         className={`flex-1 flex flex-col h-screen transition-all duration-300 
//         ${collapsed ? "ml-[68px]" : "ml-[220px]"}`}
//       >

//         {/* HEADER */}
//         <div
//           className={`fixed top-0 right-0 h-16 z-50 bg-card/95 border-b shadow-sm transition-all duration-300
//           ${collapsed ? "left-[68px]" : "left-[220px]"}`}
//         >
//           <TopHeader collapsed={collapsed} />
//         </div>

//         {/* CONTENT — gap below fixed header; title lives in TopHeader only */}
//         <main className="flex-1 overflow-y-auto bg-background">
//           <div className="min-h-full px-3 pb-4 pt-20 sm:px-4 sm:pb-6">
//             {children ?? <Outlet />}
//           </div>
//         </main>

//       </div>
//     </div>
//   );
// }