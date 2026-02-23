import { useNavigate } from "react-router-dom"
import { FaPhone, FaBook, FaUsers, FaCalendarAlt, FaCreditCard } from "react-icons/fa"
import "./Profile.css"

function Profile() {
  const navigate = useNavigate()

  const user = {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    batch: "FS-01",
    course: "Kaarte",
    joinDate: "12 Jan 2026",
    feeStatus: "Paid",
  }

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn")
    navigate("/login")
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="avatar-lg">👤</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      {/* INFO */}
      <div className="profile-section">
        <h4>Personal Information</h4>

        <div className="info-card">
          <span><FaPhone /> Phone</span>
          <p>{user.phone}</p>
        </div>

        <div className="info-card">
          <span><FaBook /> Course</span>
          <p>{user.course}</p>
        </div>

        <div className="info-card">
          <span><FaUsers /> Batch</span>
          <p>{user.batch}</p>
        </div>

        <div className="info-card">
          <span><FaCalendarAlt /> Joined On</span>
          <p>{user.joinDate}</p>
        </div>

        <div className="info-card">
          <span><FaCreditCard /> Fee Status</span>
          <p className="paid">{user.feeStatus}</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="profile-actions">
        <button className="edit-btn">Edit Profile</button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
