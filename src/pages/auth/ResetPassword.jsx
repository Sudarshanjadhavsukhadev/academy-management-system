import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"
import "./Auth.css"

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your new password</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleUpdate}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
