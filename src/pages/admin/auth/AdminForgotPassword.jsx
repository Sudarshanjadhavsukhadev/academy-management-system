import { useState } from "react"
import { supabase } from "../../../services/supabase"

function AdminForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleReset = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/admin/reset-password"
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Password reset link sent to email")
    }
  }

  return (
    <div className="login-card">
      <h2>Reset Password</h2>

      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}

export default AdminForgotPassword
