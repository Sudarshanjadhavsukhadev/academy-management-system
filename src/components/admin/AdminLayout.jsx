import { useEffect, useRef } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"

import { supabase } from "../../services/supabase"

import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import "./AdminLayout.css"

const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 minutes

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const idleTimer = useRef(null)

  // 🔐 Logout admin
  const logoutAdmin = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login", { replace: true })
  }

  // 🔁 Reset idle timer on activity
  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current)

    idleTimer.current = setTimeout(() => {
      alert("Session expired due to inactivity")
      logoutAdmin()
    }, IDLE_TIMEOUT)
  }

  useEffect(() => {
    // 🧠 Track user activity
    const events = ["mousemove", "keydown", "click", "scroll"]

    events.forEach(event =>
      window.addEventListener(event, resetIdleTimer)
    )

    resetIdleTimer()

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetIdleTimer)
      )
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  useEffect(() => {
    const contentDiv = document.querySelector(".content")

    if (contentDiv) {
      contentDiv.scrollTo({
        top: 0,
        behavior: "smooth"   // 👈 THIS IS SLOW SCROLL
      })
    }
  }, [location.pathname])

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />
        {/* 🔥 THIS IS REQUIRED */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
