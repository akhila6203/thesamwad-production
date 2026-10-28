import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UICustomizationProvider } from "@/contexts/UICustomizationContext";

// PUBLIC
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminRegister from "@/pages/AdminRegister";
import PublicCoursePage from "./components/homecomponents/PublicCoursePage";

// ADMIN
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCourses from "@/pages/admin/Courses";
import Students from "@/pages/admin/Students";
import Materials from "@/pages/admin/Materials";
import AdminSettings from "@/pages/admin/Settings";
import AdminBanners from "@/pages/admin/Banners";
import AdminHomeVideo from "@/pages/admin/HomeVideo";
// import AdminSubjects from "@/pages/admin/Subjects";

// USER
import UserDashboard from "@/pages/user/Dashboard";
import UserCourses from "@/pages/user/Courses";
// import MyMaterials from "@/pages/user/MyMaterials";
import UserSettings from "@/pages/user/Settings";
import UserDevelopment from "@/pages/user/Development";

import NotFound from "@/pages/NotFound";
import CreateCourse from "@/pages/admin/CreateCourse";
import CourseDetails from "@/pages/admin/CourseDetails";
import UserCourseDetails from "@/pages/user/CourseViewPage";
import MainLayout from "./layouts/MainLayout";
import About from "@/pages/About";

const queryClient = new QueryClient();

// ✅ NEW CODE
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import HomeCoursesPage from "./components/homecomponents/HomeCoursesPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { isLearnerSession } from "@/utils/publicRoutes";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const RedirectLegacyCourseId = () => {
  const { id } = useParams();
  return <Navigate to={`/classes/${id}`} replace />;
};

const RedirectLegacyAdminCourseId = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/classes/${id}`} replace />;
};

const ProtectedRoute = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} />;
  }

  return user.role === "admin" ? <AdminLayout /> : <UserLayout />;
};

const AdminOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login?type=admin" />;
  if (user.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
};

const RoleRoute = ({ adminElement, userElement }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" ? adminElement : userElement;
};

const ClassGate = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <MainLayout>
        <PublicCoursePage />
      </MainLayout>
    );
  }

  return (
    <UserLayout>
      <UserCourseDetails />
    </UserLayout>
  );
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role === "user" || isLearnerSession(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const LoginRoute = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  const loginPage = <Login />;
  if (!GOOGLE_CLIENT_ID) return loginPage;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {loginPage}
    </GoogleOAuthProvider>
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>

                {/* PUBLIC */}
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/admin/register" element={<AdminRegister />} />

                <Route element={<MainLayout />}>
                  <Route
                      path="/"
                      element={
                        <PublicRoute>
                          <Home />
                        </PublicRoute>
                      }
                    />

                    <Route
                      path="/homeclasses"
                      element={
                        <PublicRoute>
                          <HomeCoursesPage />
                        </PublicRoute>
                      }
                    />
                    <Route path="/homecourses" element={<Navigate to="/homeclasses" replace />} />
                  <Route
                    path="/about"
                    element={
                      <PublicRoute>
                        <About />
                      </PublicRoute>
                    }
                  />
                </Route>

                {/* Class details (public preview OR full after login) */}
                <Route path="/classes/:id" element={<ClassGate />} />
                <Route path="/courses/:id" element={<RedirectLegacyCourseId />} />
                          
                {/* PROTECTED */}
                <Route element={<ProtectedRoute />}>
                  
                  <Route
                    path="/dashboard"
                    element={<RoleRoute adminElement={<AdminDashboard />} userElement={<UserDashboard />} />}
                  />
                  <Route
                    path="/classes"
                    element={<RoleRoute adminElement={<AdminCourses />} userElement={<UserCourses />} />}
                  />
                  <Route path="/courses" element={<Navigate to="/classes" replace />} />
                  <Route
                    path="/classes/create"
                    element={
                      <AdminOnlyRoute>
                        <CreateCourse />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route path="/courses/create" element={<Navigate to="/classes/create" replace />} />
                  <Route path="/development" element={<UserDevelopment />} />
                  <Route
                    path="/my-learning"
                    element={<Navigate to="/settings?tab=learning" replace />}
                  />

                  {/* MATERIALS */}
                  {/* <Route
                    path="/materials"
                    element={<RoleRoute adminElement={<Materials />} userElement={<MyMaterials />} />}
                  /> */}
                  <Route
                    path="/materials"
                    element={<RoleRoute adminElement={<Materials />}  />}
                  />

                  {/* SETTINGS */}
                  <Route
                    path="/settings"
                    element={<RoleRoute adminElement={<AdminSettings />} userElement={<UserSettings />} />}
                  />

                  {/* ADMIN ONLY */}
                  <Route
                    path="/students"
                    element={
                      <AdminOnlyRoute>
                        <Students />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/admin/classes/:id"
                    element={
                      <AdminOnlyRoute>
                        <CourseDetails />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route path="/admin/courses/:id" element={<RedirectLegacyAdminCourseId />} />
                  <Route
                    path="/admin/banners"
                    element={
                      <AdminOnlyRoute>
                        <AdminBanners />
                      </AdminOnlyRoute>
                    }
                  />

                  <Route
                    path="/admin/home-video"
                    element={
                      <AdminOnlyRoute>
                        <AdminHomeVideo />
                      </AdminOnlyRoute>
                    }
                  />

                  {/* <Route
                    path="/subjects"
                    element={
                      <AdminOnlyRoute>
                        <AdminSubjects />
                      </AdminOnlyRoute>
                    }
                  /> */}

                </Route>

                {/* NOT FOUND */}
                <Route path="*" element={<NotFound />} />

              </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UICustomizationProvider>
          <TooltipProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthProvider>
                <Toaster />
                <Sonner />
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </UICustomizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider>
//         <UICustomizationProvider>
//           <TooltipProvider>
//             <BrowserRouter
//               future={{
//                 v7_startTransition: true,
//                 v7_relativeSplatPath: true,
//               }}
//             >
//               <AuthProvider>
//                 <Toaster />
//                 <Sonner />
//                 <AppRoutes />
//               </AuthProvider>
//             </BrowserRouter>
//           </TooltipProvider>
//         </UICustomizationProvider>
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// };

export default App;





//--------backend .env file code--------------------

// # PORT=5000

// # JWT_SECRET=lmssecret

// PORT=5000

// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=
// DB_NAME=lms_project

// NODE_ENV=development
// JWT_SECRET=lms_secret_key

// # Google OAuth (Web client) — same Client ID as frontend VITE_GOOGLE_CLIENT_ID

// GOOGLE_CLIENT_ID=725329815724-vlhbje8qmospvf1lk78l8cnp6q1q1f1o.apps.googleusercontent.com
// # GOOGLE_CLIENT_ID=44768809191-06o2cddv0gci0rtf28cibp0042qat62j.apps.googleusercontent.com

// # FRONTEND_URL=http://localhost:8080

// FRONTEND_URL=https://thesamwad.com


// # FRONTEND_URL=https://lms-nine-jet.vercel.app
// # thesamwad.com
// # 725329815724-vlhbje8qmospvf1lk78l8cnp6q1q1f1o.apps.googleusercontent.com




//--------frontend .env file code--------------------

// VITE_GOOGLE_CLIENT_ID=725329815724-vlhbje8qmospvf1lk78l8cnp6q1q1f1o.apps.googleusercontent.com
// # VITE_GOOGLE_CLIENT_ID=44768809191-06o2cddv0gci0rtf28cibp0042qat62j.apps.googleusercontent.com


// # VITE_API_URL=http://localhost:5000/api

// VITE_API_URL=https://api.thesamwad.com/api


// # VITE_API_URL=https://lms-backend-9bwp.onrender.com
// # http://api.thesamwad.com





