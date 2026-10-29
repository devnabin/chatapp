import "./Sidebar.css";
function Sidebar({
  contacts,
  recipient,
  handleSelectUser,
  isGroupChat,
  handleSelectGroup,
  isAIChat,
  handleSelectAI,
}) {
  return (
        <aside className="dashboard-sidebar">
          <h2 className="dashboard-sidebar-title">Active users</h2>

          <div className="active-users">
            {contacts.length === 0 ? (
              <p className="active-users-empty">No one else online</p>
            ) : (
              contacts.map((activeUsername) => (
                <button
                  type="button"
                  className={`active-user ${
                    recipient === activeUsername
                      ? "active-user-selected"
                      : ""
                  }`}
                  key={activeUsername}
                  onClick={() => handleSelectUser(activeUsername)}
                >
                  <span className="active-user-dot" />
                  <span>{activeUsername}</span>
                </button>
              ))
            )}
          </div>

          {/* Fixed channels pinned at the bottom of the first column. */}
          <div className="sidebar-channels">
            {/* Button that opens the shared global room. */}
            <button
              type="button"
              className={`sidebar-channel ${
                isGroupChat
                  ? "sidebar-channel-selected"
                  : ""
              }`}
              onClick={handleSelectGroup}
            >
              {/* Small icon marker for the group room. */}
              <span className="sidebar-channel-icon" aria-hidden="true">
                #
              </span>
              {/* Text label for the button. */}
              <span>Group chat</span>
            </button>

            {/* Button that opens the AI assistant chat. */}
            <button
              type="button"
              className={`sidebar-channel ${
                isAIChat ? "sidebar-channel-selected" : ""
              }`}
              onClick={handleSelectAI}
            >
              {/* Small icon marker for the AI chat. */}
              <span className="sidebar-channel-icon" aria-hidden="true">
                AI
              </span>
              {/* Text label for the button. */}
              <span>Bin AI Chat</span>
            </button>
          </div>
        </aside>
  );
}


export default Sidebar;
