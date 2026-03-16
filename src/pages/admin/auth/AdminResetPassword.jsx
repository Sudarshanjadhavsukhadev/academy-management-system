import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import { useNavigate } from "react-router-dom"

function AdminResetPassword() {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {

    const { data: authListener } =
      supabase.auth.onAuthStateChange((event, session) => {

        if (event === "PASSWORD_RECOVERY") {
          console.log("Recovery session detected ✅")
          setSessionReady(true)
        }

      })

    return () => {
      authListener.subscription.unsubscribe()
    }

  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!sessionReady) {
      alert("Recovery session not ready. Please open link again.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert("✅ Password updated successfully")

      await supabase.auth.signOut()

      navigate("/admin/login")
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-card">

        <h2>Set New Password</h2>

        <form onSubmit={handleUpdate}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

      </div>
    </div>
  )
}

export default AdminResetPassword