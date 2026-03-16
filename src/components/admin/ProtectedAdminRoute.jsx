import { Navigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function ProtectedAdminRoute({ children }) {

  const location = useLocation()

  // ⭐⭐⭐ VERY IMPORTANT — RETURN BEFORE ANY HOOK LOGIC
  if (
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/forgot-password" ||
    location.pathname.startsWith("/admin/reset-password")
  ) {
    return children
  }

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {

    let mounted = true

    const checkAdmin = async () => {

      const { data } = await supabase.auth.getSession()

      const session = data.session

      if (!session) {
        if (mounted) setLoading(false)
        return
      }

      try {

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (mounted && profile?.role === "admin") {
          setIsAdmin(true)
        }

      } catch (err) {
        console.log(err.message)
      }

      if (mounted) setLoading(false)

    }

    checkAdmin()

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {

        if (event === "SIGNED_OUT") {
          setIsAdmin(false)
        }

      })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }

  }, [])

  if (loading) {
    return <div style={{ padding: 50 }}>Checking admin session...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdminRoute