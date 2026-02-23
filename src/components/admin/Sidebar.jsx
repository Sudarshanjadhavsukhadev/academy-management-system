import { NavLink } from "react-router-dom"
import "./AdminLayout.css"

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">MJK Admin</h2>

      <nav className="menu">
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/students">Students</NavLink>

        <NavLink to="/admin/trainers">Trainers</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <NavLink to="/admin/batches">Batches</NavLink>
        <NavLink to="/admin/accounts">Accounts</NavLink>
        <NavLink to="/admin/reports">Reports</NavLink>
        <NavLink to="/admin/settings">Settings</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
