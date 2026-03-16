import { useState, useRef, useEffect } from "react"
import { supabase } from "../../../services/supabase"

function AdminForgotPassword() {

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCooldown = () => {

    let seconds = 60

    setCooldown(seconds)

    timerRef.current = setInterval(() => {

      seconds--

      setCooldown(seconds)

      if (seconds <= 0) {
        clearInterval(timerRef.current)
      }

    }, 1000)
  }

  const handleReset = async (e) => {

    e.preventDefault()

    if (!email) return

    if (cooldown > 0) return

    setLoading(true)
    setMessage("")

    try {

      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo:
            "https://academy-management-system-a2tg.vercel.app/admin/reset-password"
        })

      if (error) throw error

      setMessage("✅ Reset link sent to your email")
      startCooldown()

    } catch (err) {

      setMessage(err.message || "Something went wrong")

    }

    setLoading(false)
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
            onChange={(e)=>setEmail(e.target.value)}
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