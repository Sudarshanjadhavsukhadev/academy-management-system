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
     redirectTo: "https://academy-management-system.vercel.app/admin/reset-password"
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("✅ Password reset link sent to your email")
    }

    setLoading(false)
  }

  return (
    <div className="admin-login-page">

      <div className="login-card">

        <h2>Reset Password</h2>
        <p>Enter your admin email to receive reset link</p>

        <form onSubmit={handleReset}>

          <input
            type="email"
            placeholder="Admin Email"
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