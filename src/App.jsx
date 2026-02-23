import { Routes, Route, Navigate } from "react-router-dom"

/* AUTH */
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"

/* USER */
import UserLayout from "./layouts/UserLayout"
import UserLogin from "./pages/user/auth/UserLogin"
import UserSignup from "./pages/user/auth/UserSignup"
import UserDashboard from "./pages/user/dashboard/UserDashboard"
import Profile from "./pages/user/profile/Profile"
import UserCourseDetails from "./pages/user/course/UserCourseDetails"
import UserProgress from "./pages/user/progress/UserProgress"

/* ADMIN */
import AdminLogin from "./pages/admin/auth/AdminLogin"
import AdminForgotPassword from "./pages/admin/auth/AdminForgotPassword"
import AdminResetPassword from "./pages/admin/auth/AdminResetPassword"
import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard"
import Students from "./pages/admin/students/Students"
import Trainers from "./pages/admin/trainers/Trainers"
import Courses from "./pages/admin/courses/Courses"
import Batches from "./pages/admin/batches/Batches"
import Accounts from "./pages/admin/accounts/Accounts"
import Reports from "./pages/admin/reports/Reports"
import Settings from "./pages/admin/settings/Settings"

/* TRAINER */
import TrainerLogin from "./pages/trainer/auth/TrainerLogin"
import TrainerRegister from "./pages/trainer/auth/TrainerRegister"
import TrainerLayout from "./layouts/TrainerLayout"
import TrainerDashboard from "./pages/trainer/dashboard/TrainerDashboard"
import TrainerAttendance from "./pages/trainer/attendance/TrainerAttendance"
import TrainerProfile from "./pages/trainer/profile/TrainerProfile"

/* PROTECTED */
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute"
import ProtectedUserRoute from "./components/user/ProtectedUserRoute"
import ProtectedTrainerRoute from "./components/trainer/ProtectedTrainerRoute"

function App() {
  return (
    <Routes>

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* MAIN AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* USER AUTH */}
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/signup" element={<UserSignup />} />

      {/* ADMIN AUTH */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      {/* ADMIN PROTECTED */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="courses" element={<Courses />} />
        <Route path="batches" element={<Batches />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* USER PROTECTED */}
      <Route
        path="/user"
        element={
          <ProtectedUserRoute>
            <UserLayout />
          </ProtectedUserRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="course/:courseId" element={<UserCourseDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="progress" element={<UserProgress />} />
      </Route>

      {/* TRAINER AUTH */}
      <Route path="/trainer/login" element={<TrainerLogin />} />
      <Route path="/trainer/register" element={<TrainerRegister />} />

      {/* TRAINER PROTECTED */}
      <Route
        path="/trainer"
        element={
          <ProtectedTrainerRoute>
            <TrainerLayout />
          </ProtectedTrainerRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="attendance" element={<TrainerAttendance />} />
        <Route path="profile" element={<TrainerProfile />} />
      </Route>

    </Routes>
  )
}

export default App
