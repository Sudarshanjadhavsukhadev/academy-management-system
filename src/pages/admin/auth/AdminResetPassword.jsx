import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import { useNavigate } from "react-router-dom"

function AdminResetPassword() {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")   // ⭐ NEW
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {

    if (window.location.hash) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      )
    }

    let mounted = true

    const prepareRecoverySession = async () => {
      await new Promise(res => setTimeout(res, 800))

      const { data } = await supabase.auth.getSession()

      if (data.session && mounted) {
        setSessionReady(true)
      }
    }

    prepareRecoverySession()

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {

        if (event === "PASSWORD_RECOVERY") {
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

    // ⭐ PASSWORD MATCH VALIDATION
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

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
  const isMatch =
    password &&
    confirmPassword &&
    password === confirmPassword

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

          <div className="confirm-password-wrapper">

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {isMatch && <span className="tick">✔</span>}

          </div>
          <button disabled={loading || !isMatch}>
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

      </div>

    </div>
  )
}

export default AdminResetPassword