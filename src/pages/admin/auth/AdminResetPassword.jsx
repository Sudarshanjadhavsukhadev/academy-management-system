import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import { useNavigate } from "react-router-dom"

function AdminResetPassword() {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {

    const checkExistingSession = async () => {

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        console.log("✅ Session already available")
        setSessionReady(true)
      }

    }

    checkExistingSession()

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {

        if (event === "PASSWORD_RECOVERY") {
          console.log("✅ Recovery session ready")
          setSessionReady(true)
        }

      })

    return () => listener.subscription.unsubscribe()

  }, [])
  const handleUpdate = async (e) => {
    e.preventDefault()



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

  if (!sessionReady) {
    return <h2>Preparing reset session...</h2>
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