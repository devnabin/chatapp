import "./Navbar.css";
import Darkmode from "../Utilities/Darkmode";

function Navbar({
  handleDashboardNavigation,
  username,
  isConnected,
  handleProfileNavigation,
  handleLogout,
}) {
  return (
      <nav className="dashboard-navbar">
        <button
          type="button"
          className="dashboard-brand"
          onClick={handleDashboardNavigation}
          aria-label="Go to dashboard"
        >
          <span className="dashboard-brand-name">
            BinChat
          </span>
        </button>

        <div className="dashboard-user-status">
          <div className="dashboard-header">
            <h1>Hello, {username}</h1>
            <p>Chat in your space.</p>
          </div>

          <div
            className={`dashboard-connection ${
              isConnected
                ? "dashboard-connection-connected"
                : "dashboard-connection-disconnected"
            }`}
            aria-live="polite"
          >
            <span className="dashboard-connection-dot" />

            <span>
              {isConnected ? "connected" : "disconnected"}
            </span>
          </div>
        </div>

        <div className="dashboard-navbar-actions">
          <button
            type="button"
            className="dashboard-nav-button"
            onClick={handleProfileNavigation}
            title="View profile"
          >
            <span className="dashboard-avatar" aria-hidden="true">
              {username?.charAt(0).toUpperCase()}
            </span>
            <span>Profile</span>
          </button>

          <span className="dashboard-navbar-divider" aria-hidden="true" />

          <div className="dashboard-darkmode">
            <Darkmode />
          </div>

          <button
            type="button"
            className="dashboard-logout-button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </nav>
  );
}


export default Navbar;
