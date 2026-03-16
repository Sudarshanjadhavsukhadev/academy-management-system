import { Routes, Route, Navigate } from "react-router-dom"
import AttendanceReport from "./pages/admin/attendance/AttendanceReport"
/* AUTH */




/* ADMIN */
import AdminLogin from "./pages/admin/auth/AdminLogin"
import AdminForgotPassword from "./pages/admin/auth/AdminForgotPassword"
import AdminResetPassword from "./pages/admin/auth/AdminResetPassword"
import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard"
import Students from "./pages/admin/students/Students"
import Trainers from "./pages/admin/trainers/Trainers"
import Courses from "./pages/admin/courses/courses"
import Batches from "./pages/admin/batches/Batches"
import Accounts from "./pages/admin/accounts/Accounts"
import Reports from "./pages/admin/reports/Reports"
import Settings from "./pages/admin/settings/Settings"
import AddBatch from "./pages/admin/AddBatch"
import AddBranch from "./pages/admin/AddBranch"
import AddActivity from "./pages/admin/AddActivity"
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
        <Route path="attendance-report" element={<AttendanceReport />} />
        <Route path="add-batch" element={<AddBatch />} />
        <Route path="branches" element={<AddBranch />} />
        <Route path="add-activity" element={<AddActivity />} />
      </Route>

      {/* USER PROTECTED */}
     

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
