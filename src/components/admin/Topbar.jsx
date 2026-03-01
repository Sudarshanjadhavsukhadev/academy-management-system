import "./AdminLayout.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function Topbar() {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("")

  useEffect(() => {
    const getAdminProfile = async () => {
      const { data } = await supabase.auth.getUser()

      if (data?.user) {
        // later we will store image URL in user metadata
        const imageUrl = data.user.user_metadata?.profile_image
        if (imageUrl) {
          setProfileImage(imageUrl)
        }
      }
    }

    getAdminProfile()
  }, [])

  return (
    <header className="topbar">
      <h3>Admin Dashboard</h3>

      <div
        className="topbar-right"
        onClick={() => navigate("/admin/settings")}
        style={{ cursor: "pointer" }}
      >
        <span className="admin-name">Admin</span>

        <img
          src={
            profileImage ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt="admin"
          className="admin-avatar"
        />
      </div>
    </header>
  )
}

export default Topbar