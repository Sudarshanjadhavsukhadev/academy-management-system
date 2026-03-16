import { useState } from "react"
import { supabase } from "../../../services/supabase"

function AdminForgotPassword() {

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const handleReset = async (e) => {
    e.preventDefault()

    if (cooldown > 0) return

    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          "https://academy-management-system-a2tg.vercel.app/admin/reset-password"
      })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("✅ Reset link sent")

    // ⭐ start cooldown
    let seconds = 60
    setCooldown(seconds)

    const timer = setInterval(() => {
      seconds--

      setCooldown(seconds)

      if (seconds <= 0) {
        clearInterval(timer)
      }
    }, 1000)

  }

  return (
    <div className="admin-login-page">
      <div className="login-card">

        <h2>Reset Password</h2>

        <form onSubmit={handleReset}>

          <input
            type="email"
            value={email}
            placeholder="Enter admin email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button disabled={loading || cooldown > 0}>
            {loading
              ? "Sending..."
              : cooldown > 0
                ? `Wait ${cooldown}s`
                : "Send Reset Link"}
          </button>

        </form>

        {message && <div className="success-msg">{message}</div>}

      </div>
    </div>
  )
}

export default AdminForgotPassword