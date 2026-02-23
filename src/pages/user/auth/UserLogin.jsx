import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./UserAuth.css"

function UserLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()

    // TEMP USER AUTH (replace with backend later)
    if (email.trim() && password.trim()) {
      localStorage.setItem("isUserLoggedIn", "true")
      navigate("/user")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>
        <p>Login to continue learning</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="switch">
          Don’t have an account? <Link to="/user/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default UserLogin
