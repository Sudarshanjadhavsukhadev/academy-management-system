import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../../services/supabase"
import "./Auth.css"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage("Password reset link sent to your email")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">We’ll send you a reset link</p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn primary full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="switch">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
