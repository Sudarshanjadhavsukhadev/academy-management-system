import { useState } from "react"
import "./Settings.css"

function Settings() {
  const [academy, setAcademy] = useState({
    name: "MJK Academy",
    email: "info@mjkacademy.com",
    phone: "9876543210",
    address: "Mumbai, Maharashtra",
  })

  const [admin, setAdmin] = useState({
    name: "Admin User",
    email: "admin@mjkacademy.com",
    password: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")

  const [finance, setFinance] = useState({
    currency: "INR",
    gst: "18%",
    defaultFeeStatus: "Paid",
  })

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    window.location.href = "/admin/login"
  }

  return (
    <div className="settings-page">
      <div className="admin-container">
        <h1 className="settings-title">Settings</h1>

        {/* ===== ADMIN PROFILE ===== */}
        <div className="settings-card">
          <h3>Admin Profile</h3>

          <div className="admin-profile-grid">

            {/* LEFT SIDE - IMAGE */}
            <div className="profile-section">
              <div className="profile-preview">
                <img
                  src={
                    previewImage ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="profile"
                />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setProfileImage(file)
                    setPreviewImage(URL.createObjectURL(file))
                  }
                }}
              />
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="profile-form">
              <input
                placeholder="Admin Name"
                value={admin.name}
                onChange={(e) =>
                  setAdmin({ ...admin, name: e.target.value })
                }
              />

              <input
                placeholder="Admin Email"
                value={admin.email}
                onChange={(e) =>
                  setAdmin({ ...admin, email: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="New Password"
                value={admin.password}
                onChange={(e) =>
                  setAdmin({ ...admin, password: e.target.value })
                }
              />

              <button className="save-btn">Update Profile</button>
            </div>

          </div>
        </div>
        {/* ===== ACADEMY SETTINGS ===== */}
        <div className="settings-card">
          <h3>Academy Details</h3>

          <div className="settings-form">
            <input
              placeholder="Academy Name"
              value={academy.name}
              onChange={(e) =>
                setAcademy({ ...academy, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              value={academy.email}
              onChange={(e) =>
                setAcademy({ ...academy, email: e.target.value })
              }
            />
            <input
              placeholder="Phone"
              value={academy.phone}
              onChange={(e) =>
                setAcademy({ ...academy, phone: e.target.value })
              }
            />
            <input
              placeholder="Address"
              value={academy.address}
              onChange={(e) =>
                setAcademy({ ...academy, address: e.target.value })
              }
            />
          </div>

          <button className="save-btn">Save Academy Details</button>
        </div>



        {/* ===== FINANCE SETTINGS ===== */}
        <div className="settings-card">
          <h3>Finance Settings</h3>

          <div className="settings-form">
            <select
              value={finance.currency}
              onChange={(e) =>
                setFinance({ ...finance, currency: e.target.value })
              }
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>

            <input
              placeholder="GST Percentage"
              value={finance.gst}
              onChange={(e) =>
                setFinance({ ...finance, gst: e.target.value })
              }
            />

            <select
              value={finance.defaultFeeStatus}
              onChange={(e) =>
                setFinance({
                  ...finance,
                  defaultFeeStatus: e.target.value,
                })
              }
            >
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>

          <button className="save-btn">Save Finance Settings</button>
        </div>

        {/* ===== SYSTEM ===== */}
        <div className="settings-card danger">
          <h3>System</h3>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
