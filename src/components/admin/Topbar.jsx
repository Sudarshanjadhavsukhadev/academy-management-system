import "./AdminLayout.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function Topbar() {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("")

  useEffect(() => {

    const getAdminProfile = async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) return

      const userId = userData.user.id

      const { data } = await supabase
        .from("profiles")
        .select("profile_photo")
        .eq("id", userId)
        .single()

      if (data?.profile_photo) {
        setProfileImage(data.profile_photo)
      }

    }

    getAdminProfile()

    // reload when window focus changes
    window.addEventListener("focus", getAdminProfile)

    return () => window.removeEventListener("focus", getAdminProfile)

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