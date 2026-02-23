import { useState } from "react"
import { supabase } from "../../../services/supabase"
import { useNavigate } from "react-router-dom"

function AdminResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")

  const handleUpdate = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Password updated successfully")
      navigate("/admin/login")
    }
  }

  return (
    <div className="login-card">
      <h2>Set New Password</h2>

      <form onSubmit={handleUpdate}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  )
}

export default AdminResetPassword
