import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./TrainerHeader.css"

const TrainerHeader = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="trainer-header">
        <div className="header-content">
          <h3>MJK Academy Trainer</h3>

          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      {open && (
        <div className="overlay" onClick={() => setOpen(false)} />
      )}

      <div className={`side-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h4>Menu</h4>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <ul className="drawer-menu">
          <li
            className="drawer-item"
            onClick={() => {
              navigate("/trainer/profile")
              setOpen(false)
            }}
          >
            Edit Profile
          </li>

          <li
            className="drawer-item"
            onClick={() => {
              navigate("/trainer/dashboard")
              setOpen(false)
            }}
          >
            Batches
          </li>
        </ul>
      </div>
    </>
  )
}

export default TrainerHeader