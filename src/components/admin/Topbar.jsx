import "./AdminLayout.css"

function Topbar() {
  return (
    <header className="topbar">
      <h3>Admin Dashboard</h3>

      <div className="topbar-right">
        <span className="admin-name">Admin</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="admin"
          className="admin-avatar"
        />
      </div>
    </header>
  )
}

export default Topbar
