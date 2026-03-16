import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../../../services/supabase"
import "./AdminLogin.css"

function AdminLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()

    setError("")
    setLoading(true)

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const user = data.user

      // ⭐ check admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (profile.role !== "admin") {

        await supabase.auth.signOut()

        setError("Access denied. Not an admin.")
        setLoading(false)
        return
      }

      // ⭐ success
      localStorage.setItem("isAdminLoggedIn", "true")

      navigate("/admin", { replace: true })

    } catch (err) {

      setError(err.message || "Login failed")

    }

    setLoading(false)
  }

  return (
    <div className="admin-login-page">

      <div className="login-card">

        <h2>Admin Login</h2>
        <p>Secure access to MJK Admin Panel</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <span onClick={()=>setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="links">
          <Link to="/admin/forgot-password">
            Forgot password?
          </Link>
        </div>

      </div>

    </div>
  )
}

export default AdminLogin