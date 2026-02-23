import { useNavigate } from "react-router-dom"
import "./UserHeader.css"

function UserHeader({ title, subtitle, showBack }) {
  const navigate = useNavigate()

  return (
    <header className="user-header">
      <div className="header-left">
        {showBack && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
        )}
        <div className="brand">
          <h2>{title}</h2>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>

      <div className="user-avatar">👤</div>
    </header>
  )
}

export default UserHeader
