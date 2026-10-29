import "./ChatWindow.css";
function ChatWindow({
  recipient,
  isGroupChat,
  isAIChat,
  chatTitle,
  displayedMessages,
  username,
  isAiLoading,
  handleSubmit,
  message,
  messagePlaceholder,
  canSendMessage,
  setMessage,
  isConnected,
}) {
  return (
        <section className="dashboard-chat">
          <header className="chat-header">
            {recipient ? (
              <span className="active-user-dot" />
            ) : (
              <span className="sidebar-channel-icon" aria-hidden="true">
                {isGroupChat ? "#" : isAIChat ? "AI" : "—"}
              </span>
            )}
            <span>{chatTitle}</span>
          </header>

          <div className="chat-messages">
            {displayedMessages.length === 0 ? (
              <p className="chat-empty">
                {isGroupChat
                  ? "No group messages yet. Start the conversation!"
                  : isAIChat
                    ? "Ask Bin Chat a question to start the conversation."
                  : "No messages yet."}
              </p>
            ) : (
              displayedMessages.map((chatMessage, index) => {
                const sender =
                  chatMessage.sender ??
                  chatMessage.message?.sender ??
                  "Unknown user";

                const messageText =
                  typeof chatMessage.message === "string"
                    ? chatMessage.message
                    : chatMessage.message?.message ?? "Message received";

                const isOwn = sender === username;

                return (
                  <div
                    className={`message-item ${
                      isOwn ? "message-item-own" : ""
                    } ${chatMessage.isError ? "message-item-error" : ""}`}
                    key={`${sender}-${index}`}
                    role={chatMessage.isError ? "alert" : undefined}
                  >
                    <strong>{isOwn ? "You" : sender}</strong>
                    <p>{messageText}</p>
                  </div>
                );
              })
            )}

            {isAIChat && isAiLoading && (
              <div className="message-item" aria-live="polite">
                <strong>Bin Chat</strong>
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              placeholder={messagePlaceholder}
              disabled={!canSendMessage || (isAIChat && isAiLoading)}
              aria-label={messagePlaceholder}
              onChange={(event) => setMessage(event.target.value)}
            />

            <button
              type="submit"
              disabled={
                !canSendMessage ||
                (!isAIChat && !isConnected) ||
                !message.trim() ||
                (isAIChat && isAiLoading)
              }
              aria-label={isAIChat && isAiLoading ? "Thinking" : "Send message"}
            >
              {isAIChat && isAiLoading ? (
                <span className="chat-send-spinner" aria-hidden="true" />
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </form>
        </section>
  );
}


export default ChatWindow;
