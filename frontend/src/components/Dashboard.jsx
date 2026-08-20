import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";

const AI_CONTACT = {
  username: "BinChat AI",
  status: "Happy to assist you",
  isAI: true,
};

function makeMessage(sender, text, extra = {}) {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    ...extra,
  };
}

function normalizeActiveUser(user) {
  if (typeof user === "string") {
    return { username: user, status: "Available to chat", isAI: false };
  }

  return {
    username: user.username ?? user.name ?? "",
    status: user.status ?? user.statusMessage ?? "Available to chat",
    isAI: false,
  };
}

function Avatar({ name, isAI = false }) {
  return (
    <span className={`avatar ${isAI ? "avatar-ai" : "avatar-user"}`}>
      {isAI ? "✦" : name.charAt(0).toUpperCase()}
      <span className="online-dot" />
    </span>
  );
}

export default function Dashboard() {
  const { username = "User" } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(AI_CONTACT);
  const [searchText, setSearchText] = useState("");
  const [draft, setDraft] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("binchat-language") || "English",
  );
  const [customLanguage, setCustomLanguage] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    () => localStorage.getItem("binchat-status") || "",
  );
  const [saved, setSaved] = useState(false);

  const [conversations, setConversations] = useState(() => ({
    [AI_CONTACT.username]: [
      makeMessage(
        "assistant",
        `Hello ${username}! I’m BinChat AI. How can I help you today?`,
      ),
    ],
  }));

  useEffect(() => {
    const savedLanguage = localStorage.getItem("binchat-language");
    if (
      savedLanguage &&
      !["English", "Nepali", "Telugu", "Spanish"].includes(savedLanguage)
    ) {
      setLanguage("Other");
      setCustomLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket(
      `${WS_URL}/ws/${encodeURIComponent(username)}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: "ping" }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "active_users") {
          setActiveUsers(data.users ?? []);
          return;
        }

        if (data.type === "private_message") {
          const sender = data.sender ?? data.username ?? "Unknown user";
          setConversations((current) => ({
            ...current,
            [sender]: [
              ...(current[sender] ?? []),
              makeMessage("friend", data.message),
            ],
          }));
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    };

    socket.onerror = () => setConnected(false);

    socket.onclose = () => {
      setConnected(false);
      if (socketRef.current === socket) socketRef.current = null;
    };

    return () => {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }

      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [username]);

  useEffect(() => {
    async function getActiveUsers() {
      try {
        const response = await fetch(`${API_URL}/active`);
        if (!response.ok) return;

        const data = await response.json();
        setActiveUsers(data.activeUsers ?? []);
      } catch {
        // The connection badge already shows when the server is unavailable.
      }
    }

    getActiveUsers();
    const refreshTimer = window.setInterval(getActiveUsers, 15000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const contacts = useMemo(() => {
    const users = activeUsers
      .map(normalizeActiveUser)
      .filter(
        (user) =>
          user.username &&
          user.username.toLowerCase() !== username.toLowerCase(),
      );

    const uniqueUsers = Array.from(
      new Map(users.map((user) => [user.username, user])).values(),
    );

    return [AI_CONTACT, ...uniqueUsers];
  }, [activeUsers, username]);

  const visibleContacts = contacts.filter((contact) =>
    `${contact.username} ${contact.status}`
      .toLowerCase()
      .includes(searchText.trim().toLowerCase()),
  );

  const currentMessages = conversations[selectedContact.username] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, aiTyping]);

  function selectContact(contact) {
    setSelectedContact(contact);
    setDraft("");

    setConversations((current) => {
      if (current[contact.username]) return current;

      return {
        ...current,
        [contact.username]: [
          makeMessage(
            "system",
            `Start your private conversation with ${contact.username}.`,
          ),
        ],
      };
    });
  }

  function saveProfileSettings(event) {
    event.preventDefault();

    const selectedLanguage =
      language === "Other" ? customLanguage.trim() : language;

    if (!selectedLanguage) return;

    localStorage.setItem("binchat-language", selectedLanguage);
    localStorage.setItem("binchat-status", statusMessage.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || aiTyping) return;

    const contactName = selectedContact.username;
    const history = [
      ...(conversations[contactName] ?? []),
      makeMessage("me", text),
    ];

    setConversations((current) => ({
      ...current,
      [contactName]: history,
    }));
    setDraft("");

    if (!selectedContact.isAI) {
      const socket = socketRef.current;

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setConversations((current) => ({
          ...current,
          [contactName]: [
            ...(current[contactName] ?? []),
            makeMessage("system", "Message not sent. The server is offline.", {
              error: true,
            }),
          ],
        }));
        return;
      }

      socket.send(
        JSON.stringify({
          type: "private_message",
          recipient: contactName,
          message: text,
        }),
      );
      return;
    }

    setAiTyping(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({
          message: text,
          language:
            language === "Other" ? customLanguage.trim() : language,
          history: history.slice(-10).map((item) => ({
            role: item.sender === "me" ? "user" : "assistant",
            content: item.text,
          })),
        }),
      });

      if (!response.ok) throw new Error("AI request failed");
      const data = await response.json();

      setConversations((current) => ({
        ...current,
        [contactName]: [
          ...(current[contactName] ?? []),
          makeMessage("assistant", data.reply),
        ],
      }));
    } catch {
      setConversations((current) => ({
        ...current,
        [contactName]: [
          ...(current[contactName] ?? []),
          makeMessage(
            "system",
            "The AI service is not ready yet. Add the FastAPI /ai/chat route.",
            { error: true },
          ),
        ],
      }));
    } finally {
      setAiTyping(false);
    }
  }

  function logout() {
    socketRef.current?.close();
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>BinChat</span>
        </div>

        <div className="welcome-copy">
          <p>Hello, {username}</p>
          <span>Welcome to BinChat</span>
        </div>

        <div className="topbar-actions">
          <span className={`server-pill ${connected ? "online" : ""}`}>
            <span />
            {connected ? "Connected" : "Offline"}
          </span>
          <button className="logout-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-grid">
        <aside className="panel friends-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">People</p>
              <h2>Live now</h2>
            </div>
            <span className="count-badge">{contacts.length}</span>
          </div>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search active users"
            />
          </label>

          <div className="friend-list">
            {visibleContacts.map((contact) => (
              <button
                key={contact.username}
                className={`person-row ${
                  selectedContact.username === contact.username ? "selected" : ""
                }`}
                type="button"
                onClick={() => selectContact(contact)}
              >
                <Avatar name={contact.username} isAI={contact.isAI} />
                
                <span>
                  <strong>{contact.username}</strong>
                  <small>{contact.status}</small>
                </span>
              </button>
            ))}

            {visibleContacts.length === 0 && (
              <p className="empty-state">No active user found.</p>
            )}
          </div>
        </aside>

        <section className="ai-chat-card">
          <header className="ai-chat-header">
            <div className="ai-identity">
              <Avatar
                name={selectedContact.username}
                isAI={selectedContact.isAI}
              />
              <div>
                <h2>{selectedContact.username}</h2>
                <p>{selectedContact.status}</p>
              </div>
            </div>
            {selectedContact.isAI && <span className="beta-badge">AI</span>}
          </header>

          <div className="message-area">
            <div className="day-divider">
              <span>Today</span>
            </div>

            {currentMessages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={`message-row ${chatMessage.sender}`}
              >
                {(chatMessage.sender === "assistant" ||
                  chatMessage.sender === "friend") && (
                  <span className="message-avatar">
                    {selectedContact.isAI
                      ? "✦"
                      : selectedContact.username.charAt(0).toUpperCase()}
                  </span>
                )}

                <div
                  className={`message-bubble ${
                    chatMessage.error ? "error" : ""
                  }`}
                >
                  {chatMessage.text}
                </div>
              </div>
            ))}

            {aiTyping && selectedContact.isAI && (
              <div className="message-row assistant">
                <span className="message-avatar">✦</span>
                <div className="typing-bubble">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="ai-composer" onSubmit={sendMessage}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Message ${selectedContact.username}...`}
            />
            <button
              className="send-button"
              type="submit"
              disabled={!draft.trim() || aiTyping}
            >
              Send
            </button>
          </form>

          

          <p className="ai-note">
            {selectedContact.isAI
              ? "AI can make mistakes. Check important information."
              : connected
                ? "Private conversation"
                : "Reconnect to send private messages."}
          </p>
        </section>

        <aside className="right-column">
          <section className="panel settings-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow">Your space</p>
                <h2>Language & status</h2>
              </div>
            </div>

            <form className="settings-form" onSubmit={saveProfileSettings}>
              <label>
                Preferred language
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              {language === "Other" && (
                <label>
                  Type your language
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(event) =>
                      setCustomLanguage(event.target.value)
                    }
                    placeholder="Type any language"
                    required
                  />
                </label>
              )}

              <label>
                Your thought
                <textarea
                  value={statusMessage}
                  onChange={(event) => setStatusMessage(event.target.value)}
                  placeholder="Write your status message"
                  maxLength={100}
                  rows={4}
                />
                <small>{statusMessage.length}/100</small>
              </label>

              <div className="status-preview">
                <Avatar name={username} />
                <span>
                  <strong>{username}</strong>
                  <small>{statusMessage.trim() || "No status added yet"}</small>
                </span>
              </div>

              <button className="save-settings-button" type="submit">
                {saved ? "Saved ✓" : "Save settings"}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </main>
  );
}
