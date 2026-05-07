import { NavLink } from "react-router-dom"
import "./AdminLayout.css"

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">MJK Admin</h2>

      <nav className="menu">

        <NavLink to="/admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/admin/batches">
          Batches
        </NavLink>



        <NavLink to="/admin/trainers">
          Trainers
        </NavLink>


        <NavLink to="/admin/add-batch">
          Add Batch
        </NavLink>

        <NavLink to="/admin/branches">
          Add Branches
        </NavLink>

        <NavLink to="/admin/add-activity">
          Add Activity
        </NavLink>

        <NavLink to="/admin/revenue">
          Revenue
        </NavLink>
        <NavLink to="/admin/inactive-students">
          Inactive Students
        </NavLink>

      </nav>
      {/* ⭐ COMPANY BRANDING */}
      <div className="sidebar-company">
        Created by <span>WebNova Technology</span>
      </div>
    </aside>
  )
}

export default Sidebar