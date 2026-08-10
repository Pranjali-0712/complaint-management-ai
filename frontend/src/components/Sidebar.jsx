import { NavLink } from "react-router-dom";

function Sidebar() {

  return (

    <aside className="sidebar">

      <div className="sidebar-logo">

        <div className="logo-icon">
          💊
        </div>

        <div>

          <h2>
            Pharma Copilot
          </h2>

          <span>
            Complaint Management
          </span>

        </div>

      </div>


      <nav className="sidebar-nav">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          📊
          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/new-complaint"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          📝
          <span>
            New Complaint
          </span>
        </NavLink>


        <NavLink
          to="/complaints"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          📑
          <span>
            Complaints
          </span>
        </NavLink>


        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          📈
          <span>
            Analytics
          </span>
        </NavLink>

      </nav>


      <div className="sidebar-footer">

        <div className="online-indicator">
          <span></span>
          System Online
        </div>

        <small>
          AI Complaint Management
        </small>

      </div>

    </aside>

  );

}

export default Sidebar;