import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../../services/supabase"
import "../dashboard/TrainerDashboard.css"

const TrainerProfile = () => {
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data } = await supabase
        .from("trainers")
        .select("*")
        .eq("email", user.email)
        .single()

      setTrainer(data)
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setLoading(true)

    const { error } = await supabase
      .from("trainers")
      .update({
        name: trainer.name,
        mobile: trainer.mobile,
      })
      .eq("id", trainer.id)

    setLoading(false)

    if (!error) {
      alert("Profile Updated Successfully ✅")
      navigate("/trainer/dashboard")
    } else {
      alert("Something went wrong ❌")
    }
  }

  if (!trainer) return <p style={{ padding: "20px" }}>Loading...</p>

  return (
    <div className="profile-page">

      <div className="profile-hero">
        <button
          className="back-btn"
          onClick={() => navigate("/trainer/dashboard")}
        >
          ← Back
        </button>

        <h1>Edit Profile</h1>
        <p>Update your personal information</p>
      </div>

      <div className="profile-card">

        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            value={trainer.name}
            onChange={(e) =>
              setTrainer({ ...trainer, name: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={trainer.email}
            disabled
          />
        </div>

        <div className="input-group">
          <label>Phone</label>
          <input
            type="text"
            value={trainer.mobile}
            onChange={(e) =>
              setTrainer({ ...trainer, mobile: e.target.value })
            }
          />
        </div>

        <button
          className="profile-save-btn"
          onClick={handleSave}
        >
          Save Changes
        </button>

      </div>
    </div>
  )
}

export default TrainerProfile