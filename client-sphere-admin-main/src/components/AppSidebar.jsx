
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getSessionUser } from "@/utils/authSession";
import { useHeaderProfile } from "@/hooks/useHeaderProfile";

import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Images,
  Folder,
  Video,
} from "lucide-react";

import logo2 from "../assets/photos/lmslogo1.jpeg";

const adminMenu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Classes", path: "/classes", icon: BookOpen },
  { name: "Students", path: "/students", icon: Users },
  { name: "Materials", path: "/materials", icon: Folder },
  { name: "Banners", path: "/admin/banners", icon: Images },
  { name: "Home Video", path: "/admin/home-video", icon: Video },
  { name: "Settings", path: "/settings", icon: Settings },
];

const userMenu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Learning", path: "/settings?tab=learning", icon: BookOpen },
  { name: "Classes", path: "/classes", icon: BookOpen },
  { name: "My Materials", path: "/materials", icon: Folder },
  { name: "Settings", path: "/settings", icon: Settings },
];

function SidebarAvatar({ name, avatar, size = "md" }) {
  const [imgError, setImgError] = useState(false);

  const dim =
    size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt=""
        className={`${dim} rounded-full object-cover shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {(name || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const session = getSessionUser();
  const { name, email, avatar } = useHeaderProfile();

  // const isAdmin = session?.role === "admin";
  const isAdmin =
  String(session?.role || "").toLowerCase() === "admin";
  const menu = isAdmin ? adminMenu : userMenu;
  const roleLabel = isAdmin ? "Admin" : "Student";

  const location = useLocation();

  // Mobile drawer is enabled only for Admin
  const showMobileDrawer = isAdmin && mobileOpen;

  return (
    <>
      {/* Mobile overlay - Admin only */}
      

{isAdmin && (
  <div
    className={`admin-sidebar-overlay ${
      mobileOpen ? "admin-sidebar-overlay-visible" : ""
    }`}
    onClick={() => setMobileOpen(false)}
  />
)}
      <aside
  className={`
    fixed left-0 top-0 h-screen flex flex-col
    bg-sidebar border-r border-sidebar-border
    transition-all duration-300
    ${collapsed ? "w-[68px]" : "w-[220px]"}
    z-[60]
    ${isAdmin ? "admin-sidebar" : ""}
    ${isAdmin && mobileOpen ? "admin-sidebar-open" : ""}
  `}
>
        {/* LOGO */}
        <div className="h-24 flex items-center justify-center border-b border-sidebar-border px-2 shrink-0">
          <img
            src={logo2}
            alt="Logo"
            className={`transition-all duration-300 ${
              collapsed && !showMobileDrawer
                ? "h-10 w-10 object-contain"
                : "h-20 w-48 object-contain"
            }`}
          />
        </div>

        {/* MENU */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
          {menu.map((item) => {
            const isActive = (() => {
              if (item.path.includes("?")) {
                const [path, query] = item.path.split("?");
                const tab = new URLSearchParams(query).get("tab");
                const currentTab = new URLSearchParams(
                  location.search
                ).get("tab");

                return (
                  location.pathname === path && currentTab === tab
                );
              }

              return location.pathname === item.path;
            })();

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isAdmin) setMobileOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-3 py-3 mb-1
                  rounded-lg text-sm transition-all
                  ${
                    collapsed && !showMobileDrawer
                      ? "justify-center"
                      : "justify-start"
                  }
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />

                {(!collapsed || showMobileDrawer) && (
                  <span className="whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* PROFILE */}
        <div
          className={`mx-3 mb-3 shrink-0 ${
            collapsed && !showMobileDrawer
              ? "flex justify-center"
              : ""
          }`}
        >
          <div
            className={`rounded-xl bg-sidebar-accent/40 border border-sidebar-border ${
              collapsed && !showMobileDrawer ? "p-2" : "p-3"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                collapsed && !showMobileDrawer
                  ? "justify-center"
                  : ""
              }`}
            >
              <SidebarAvatar
                name={name}
                avatar={avatar}
                size={
                  collapsed && !showMobileDrawer ? "sm" : "md"
                }
              />

              {(!collapsed || showMobileDrawer) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sidebar-primary-foreground truncate">
                    {name}
                  </p>

                  <p className="text-[10px] text-sidebar-muted truncate">
                    {email}
                  </p>

                  <p className="text-[10px] text-sidebar-muted/80 truncate">
                    {roleLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLLAPSE - Desktop and tablet */}
        <div
          className={`p-3 border-t border-sidebar-border shrink-0 ${
            collapsed && showMobileDrawer ? "hidden" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent transition"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}


// import { useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { getSessionUser } from "@/utils/authSession";
// import { useHeaderProfile } from "@/hooks/useHeaderProfile";
// import {
//   LayoutDashboard,
//   Users,
//   Settings,
//   BookOpen,
//   ChevronLeft,
//   ChevronRight,
//   Images,
//   Folder,
//   Video,
//   GraduationCap,
// } from "lucide-react";

// import logo2 from "../assets/photos/lmslogo1.jpeg";

// const adminMenu = [
//   { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
//   { name: "Classes", path: "/classes", icon: BookOpen },
//   // { name: "Subjects", path: "/subjects", icon: GraduationCap },
//   { name: "Students", path: "/students", icon: Users },
//   { name: "Materials", path: "/materials", icon: Folder },
//   { name: "Banners", path: "/admin/banners", icon: Images },
//   { name: "Home Video", path: "/admin/home-video", icon: Video },
//   { name: "Settings", path: "/settings", icon: Settings },
// ];

// const userMenu = [
//   { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
//   { name: "My Learning", path: "/settings?tab=learning", icon: BookOpen },
//   { name: "Classes", path: "/classes", icon: BookOpen },
//   { name: "My Materials", path: "/materials", icon: Folder },
//   { name: "Settings", path: "/settings", icon: Settings },
// ];

// function SidebarAvatar({ name, avatar, size = "md" }) {
//   const [imgError, setImgError] = useState(false);
//   const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

//   if (avatar && !imgError) {
//     return (
//       <img
//         src={avatar}
//         alt=""
//         className={`${dim} rounded-full object-cover shrink-0`}
//         onError={() => setImgError(true)}
//       />
//     );
//   }

//   return (
//     <div
//       className={`${dim} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shrink-0`}
//     >
//       {(name || "U")
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .slice(0, 2)
//         .toUpperCase()}
//     </div>
//   );
// }

// export function AppSidebar({ collapsed, setCollapsed }) {
//   const session = getSessionUser();
//   const { name, email, avatar } = useHeaderProfile();
//   const menu = session?.role === "admin" ? adminMenu : userMenu;
//   const roleLabel = session?.role === "admin" ? "Admin" : "Student";
//   // const [collapsed, setCollapsed] = useState(false);
//   const location = useLocation();

//   return (

//       <aside
//         className={`fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 ${
//           collapsed ? "w-[68px]" : "w-[220px]"
//         }`}
//       > 
  
//      {/* LOGO */}
//      <div className="h-24 flex items-center justify-center border-b border-sidebar-border px-2">
//   <img
//     src={logo2}
//     alt="Logo"
//     className={`transition-all duration-300 ${
//       collapsed
//         ? "h-10 w-10 object-contain"
//         : "h-20 w-48 object-contain"
//     }`}
//   />
// </div>
//      {/* <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
//         <img
//           src={logo2}
//           alt="LMS"
//             className={`transition-all duration-300 object-contain ${
//       collapsed
//         ? "w-10 h-10"
//         : "w-16 h-auto"
//     }`}
//         />
// </div> */}
//       {/* <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3">
//         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
//           <Zap className="w-4 h-4 text-white" />
//         </div>

//         {!collapsed && (
//           <span className="font-bold text-2xl text-sidebar-primary-foreground">
//             LMS
//           </span>
//         )}
//       </div> */}

      
//       {/* ✅ MENU (YOUR CODE PLACE HERE) */}
//       <nav className="flex-1 py-4 px-3 overflow-y-auto">
//         {menu.map((item) => {
//           const isActive = (() => {
//             if (item.path.includes("?")) {
//               const [path, query] = item.path.split("?");
//               const tab = new URLSearchParams(query).get("tab");
//               const currentTab = new URLSearchParams(location.search).get("tab");
//               return location.pathname === path && currentTab === tab;
//             }
//             return location.pathname === item.path;
//           })();

//           return (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
//                 collapsed ? "justify-center" : ""
//               } ${
//                 isActive
//                   ? "bg-primary text-white"
//                   : "text-sidebar-foreground hover:bg-sidebar-accent"
//               }`}
//             >
//               <item.icon className="w-5 h-5" />
//               {!collapsed && <span>{item.name}</span>}
//             </NavLink>
//           );
//         })}
//       </nav>

//       {/* PROFILE — same image + email as header (from API) */}
//       <div className={`mx-3 mb-3 ${collapsed ? "flex justify-center" : ""}`}>
//         <div
//           className={`rounded-xl bg-sidebar-accent/40 border border-sidebar-border ${
//             collapsed ? "p-2" : "p-3"
//           }`}
//         >
//           <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
//             <SidebarAvatar name={name} avatar={avatar} size={collapsed ? "sm" : "md"} />

//             {!collapsed && (
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-semibold text-sidebar-primary-foreground truncate">
//                   {name}
//                 </p>
//                 <p className="text-[10px] text-sidebar-muted truncate">{email}</p>
//                 <p className="text-[10px] text-sidebar-muted/80 truncate">{roleLabel}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* COLLAPSE */}
//       <div className="p-3 border-t border-sidebar-border">
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent transition"
//         >
//           {collapsed ? (
//             <ChevronRight className="w-4 h-4" />
//           ) : (
//             <>
//               <ChevronLeft className="w-4 h-4" />
//               <span>Collapse</span>
//             </>
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// }






