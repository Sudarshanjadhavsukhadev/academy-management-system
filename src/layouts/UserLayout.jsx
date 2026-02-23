import { Outlet, useLocation } from "react-router-dom"
import UserHeader from "../components/user/UserHeader"
import "../styles/UserLayout.css"

function UserLayout() {
  const location = useLocation()

  // show back button on all pages except dashboard
 const showBack = location.pathname !== "/user" && location.pathname !== "/user/"


  return (
    <div className="user-layout">
      {/* 🔒 FIXED HEADER */}
      <UserHeader
        title="MJK Academy"
        subtitle="Student Dashboard"
        showBack={showBack}
      />

      {/* PAGE CONTENT */}
      <main className="user-content">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
