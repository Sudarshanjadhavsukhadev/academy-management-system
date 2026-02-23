import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../../../services/supabase"
import "./TrainerAuth.css"

const TrainerLogin = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data?.user

    if (!user) {
      alert("Login failed")
      setLoading(false)
      return
    }

    // ✅ Check if logged user exists in trainers table
    // ✅ Check if logged user exists in trainers table
    const { data: trainerData, error: trainerError } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // ❌ Trainer record missing
    if (trainerError || !trainerData) {
      alert("Not authorized as trainer")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // ❌ Trainer not approved yet
    if (trainerData.status !== "Active") {
      alert("Waiting for admin approval")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // ✅ If everything is correct
    navigate("/trainer")
    setLoading(false)
  }



  return (
    <div className="trainer-auth-container">
      <div className="trainer-auth-card">
        <h2>Trainer Login</h2>
        <p>Welcome back 👋</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/trainer/register">Register</Link>
        </p>

      </div>
    </div>
  )
}

export default TrainerLogin
