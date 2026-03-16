import { useEffect, useRef, useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../../services/supabase"

import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import "./AdminLayout.css"

const IDLE_TIMEOUT = 15 * 60 * 1000

function AdminLayout() {

  const navigate = useNavigate()
  const location = useLocation()

  const idleTimer = useRef(null)

  const [checkingAuth, setCheckingAuth] = useState(true)

  // ⭐ logout
  const logoutAdmin = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login", { replace: true })
  }

  // ⭐ idle reset
  const resetIdleTimer = () => {

    if (idleTimer.current) clearTimeout(idleTimer.current)

    idleTimer.current = setTimeout(() => {
      alert("Session expired due to inactivity")
      logoutAdmin()
    }, IDLE_TIMEOUT)

  }

  // ⭐ AUTH GUARD
  useEffect(() => {

    let mounted = true

    const checkSession = async () => {

      const { data } = await supabase.auth.getSession()

      if (!data.session) {

        navigate("/admin/login", { replace: true })
        return

      }

      if (mounted) setCheckingAuth(false)

    }

    checkSession()

    const { data: listener } =
      supabase.auth.onAuthStateChange((event, session) => {

        // ⭐ IMPORTANT
        if (event === "SIGNED_OUT") {
          navigate("/admin/login", { replace: true })
        }

        if (event === "PASSWORD_RECOVERY") {
          // allow temporary recovery session
          setCheckingAuth(false)
        }

      })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }

  }, [])

  // ⭐ idle activity tracking
  useEffect(() => {

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

  // ⭐ scroll reset
  useEffect(() => {

    const contentDiv = document.querySelector(".content")

    if (contentDiv) {
      contentDiv.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }

  }, [location.pathname])

  if (checkingAuth) {

    return (
      <div className="admin-login-page">
        <div className="login-card">
          <h2>Checking session...</h2>
        </div>
      </div>
    )

  }

  return (
    <div className="admin-layout">

      <Sidebar />

      <div className="main-area">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </div>

    </div>
  )
}

export default AdminLayout