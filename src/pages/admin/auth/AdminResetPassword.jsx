import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import { useNavigate } from "react-router-dom"

function AdminResetPassword() {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {

    // ⭐⭐⭐ VERY IMPORTANT FIX (ADD THIS HERE)
    if (window.location.hash) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      )
    }

    let mounted = true

    const prepareRecoverySession = async () => {
      // ⭐ Step 1 → wait a little because supabase processes hash token
      await new Promise(res => setTimeout(res, 800))

      const { data } = await supabase.auth.getSession()

      if (data.session && mounted) {

        console.log("✅ Recovery session ready")
        setSessionReady(true)

      }

    }

    prepareRecoverySession()

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {

        if (event === "PASSWORD_RECOVERY") {

          console.log("✅ PASSWORD_RECOVERY event")

          setSessionReady(true)

        }

      })

    return () => {

      mounted = false
      listener.subscription.unsubscribe()

    }

  }, [])

  const handleUpdate = async (e) => {

    e.preventDefault()

    setErrorMsg("")
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {

      setErrorMsg(error.message)
      return

    }

    alert("✅ Password updated successfully")

    await supabase.auth.signOut()

    navigate("/admin/login", { replace: true })

  }

  if (!sessionReady) {

    return (
      <div className="admin-login-page">
        <div className="login-card">
          <h2>Preparing secure session...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login-page">

      <div className="login-card">

        <h2>Set New Password</h2>

        {errorMsg && <div className="error">{errorMsg}</div>}

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