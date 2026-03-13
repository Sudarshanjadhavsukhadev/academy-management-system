import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function ProtectedAdminRoute({ children }) {
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let ignore = false

    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        if (!ignore) setReady(true)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (!ignore && data?.role === "admin") {
        setIsAdmin(true)
      }

      if (!ignore) setReady(true)
    }

    checkAdmin()

    return () => {
      ignore = true
    }
  }, [])

  // ⭐ Better UX
  if (!ready) {
    return <div style={{ padding: 40 }}>Checking Admin Access...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdminRoute