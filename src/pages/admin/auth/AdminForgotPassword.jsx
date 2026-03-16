import { useState } from "react"
import { supabase } from "../../../services/supabase"

function AdminForgotPassword() {

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:"https://academy-management-system.vercel.app/#/admin/reset-password"
    })

    setLoading(false)

    if (error) {
      setMessage("❌ Failed to send reset email")
    } else {
      setMessage("✅ Reset link sent to your email")
    }
  }

  return (
    <div className="admin-login-page">

      <div className="login-card">

        <h2>Reset Password</h2>
        <p>Enter your admin email to receive reset link</p>

        <form onSubmit={handleReset}>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        {message && (
          <div className="success-msg">
            {message}
          </div>
        )}

      </div>

    </div>
  )
}

export default AdminForgotPassword