import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./Dashboard.css";
import Darkmode from "./Utilities/Darkmode";

// talk
import { useSpeech } from "react-text-to-speech";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";

function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [chatType, setChatType] = useState("private_message");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  // Private chats grouped by the other person's username.
  // Shape while "bob" is logged in: { nbn: [...msgs], sabin: [...msgs], other: [...msgs] }
  const [privateMessages, setPrivateMessages] = useState({});

  // Global chat is a single shared room, so a flat list is enough.
  const [groupMessages, setGroupMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeUser, setActiveUser] = useState([]);

  // remove this
  const [ai_response, setAi_response] = useState('Something is wrong')


  const {
    Text, // Component that renders speech text in a <div> and supports standard HTML <div> props
    speechStatus, // String that stores current speech status
    isInQueue, // Indicates whether the speech is currently playing or waiting in the queue
    start, // Function to start the speech or put it in queue
    pause, // Function to pause the speech
    stop, // Function to stop the speech or remove it from queue
  } = useSpeech({
    text: ai_response,
    stableText: true, // Enable if 'text' is stable across renders for better performance
  });



  useEffect(() => {
    if (!username) {
      return;
    }

    const socket = new WebSocket(
      `${WS_URL}/ws/${encodeURIComponent(username)}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to FastAPI");
      setIsConnected(true);

      socket.send(
        JSON.stringify({
          type: "ping",
        }),
      );

      socket.send(
        JSON.stringify({
          type: "active_users",
        }),
      );
    };


    socket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data);

        if (receivedData.type === "pong") {
          console.log("Server connection is working");
          return;
        }



        // Handle a one-to-one message between two users.
        if (receivedData.type === "private_message") {
          // The logged-in user is one side of the chat.
          // The "partner" is whoever is on the other side.
          // If I am the sender, the partner is the recipient.
          // If I am not the sender, the partner is the sender.
          const partner =
            receivedData.sender === username
              ? receivedData.recipient
              : receivedData.sender;

          // Add this message to that partner's own list.
          setPrivateMessages((currentPrivateMessages) => {
            // Copy the old object so we do not mutate state directly.
            const nextPrivateMessages = { ...currentPrivateMessages };

            // Read the partner's existing messages, or start a new empty list.
            const partnerMessages = nextPrivateMessages[partner] ?? [];

            // Put the new message at the end of that partner's list.
            nextPrivateMessages[partner] = [...partnerMessages, receivedData];

            // Return the updated object as the new state.
            return nextPrivateMessages;
          });
        }

        // Handle a message sent to the shared global room.
        if (receivedData.type === "group_message") {
          // Append it to the single flat list of global messages.
          setGroupMessages((currentGroupMessages) => [
            ...currentGroupMessages,
            receivedData,
          ]);
        }


        if (receivedData.type === "active_users") {
          setActiveUser(receivedData.message);
        }

        //  {speechStatus !== "started" ? <button onClick={start}>Start</button> : <button onClick={pause}>Pause</button>}
        // <button onClick={stop}>Stop</button>

        if (receivedData.type === "ai_assistant") {
          if (receivedData.message){
            setAi_response(receivedData.message)
          }
          if (speechStatus !== "started"){
            start()
          }
        }

      } catch (error) {
        console.error("Invalid message from server:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Disconnected from FastAPI");
      setIsConnected(false);
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

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [username]);


  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedMessage = message.trim();

    if (!cleanedMessage || (chatType === "ai_chat" && isAiLoading)) {
      return;
    }

    if (chatType === "ai_chat") {
      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          sender: username,
          message: cleanedMessage,
        },
      ]);
      setMessage("");
      setIsAiLoading(true);

      try {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: cleanedMessage,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI request failed with status ${response.status}`);
        }

        const data = await response.json();

        setAiMessages((currentMessages) => [
          ...currentMessages,
          {
            sender: "Bin Chat",
            message: data.reply ?? "I could not generate a response.",
          },
        ]);
      } catch (error) {
        console.error("Bin Chat request failed:", error);
        setAiMessages((currentMessages) => [
          ...currentMessages,
          {
            sender: "Bin Chat",
            message: "Sorry, I could not respond. Please try again.",
            isError: true,
          },
        ]);
      } finally {
        setIsAiLoading(false);
      }

      return;
    }

    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    if (chatType === "private_message") {
      if (!recipient.trim()) {
        console.error("Please enter a recipient");
        return;
      }


      console.log(recipient)
      console.log(cleanedMessage)

      socket.send(
        JSON.stringify({
          type: "private_message",
          recipient: recipient.trim(),
          message: cleanedMessage,
        }),
      );

      setMessage("");
      return;
    }

    if (chatType === "group_message") {
      socket.send(
        JSON.stringify({
          type: "group_message",
          message: cleanedMessage,
        }),
      );

      setMessage("");
    }
  }


  function handleDashboardNavigation() {
    navigate(`/home/${encodeURIComponent(username)}`);
  }


  function handleProfileNavigation() {
    navigate(`/profile/${encodeURIComponent(username)}`);
  }


  function handleLogout() {
    socketRef.current?.close();
    localStorage.removeItem("accessToken");

    navigate("/login", {
      replace: true,
    });
  }


  function handleSelectUser(selectedUsername) {
    setChatType("private_message");
    setRecipient(selectedUsername);
  }


  function handleSelectGroup() {
    // Switch the chat mode to the shared global room.
    setChatType("group_message");
    // The global room has no single partner, so clear the recipient.
    setRecipient("");
  }


  function handleSelectAI() {
    // Switch the chat mode to the AI assistant.
    setChatType("ai_chat");
    // The AI chat also has no partner user, so clear the recipient.
    setRecipient("");
  }


  const contacts = activeUser.filter(
    (activeUsername) => activeUsername !== username,
  );

  // Messages for the chat that is currently open.
  // "recipient" is the partner whose button was clicked in the sidebar.
  // We just read that partner's list straight out of the object.
  // If there is no open chat, or no messages yet, use an empty list.
  const conversation = recipient
    ? privateMessages[recipient] ?? []
    : [];

  const isGroupChat = chatType === "group_message";
  const isAIChat = chatType === "ai_chat";

  const canSendMessage = Boolean(recipient) || isGroupChat || isAIChat;

  // main logic for message render
  const displayedMessages = isGroupChat
    ? groupMessages
    : isAIChat
      ? aiMessages
      : conversation;

  const chatTitle = recipient
    ? recipient
    : isGroupChat
      ? "Group Chat"
      : isAIChat
        ? "Bin Chat"
        : "Select a chat";

  const messagePlaceholder = recipient
    ? `Message ${recipient}...`
    : isGroupChat
      ? "Message Group Chat..."
      : isAIChat
        ? "Ask Bin Chat anything..."
        : "Select a chat to start messaging";




    // talk

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();



  function start_audio(){
    SpeechRecognition.startListening({continuous:true, language: "en-US"})
  }

  function end_audio(){
    if (!transcript){ return; }
    SpeechRecognition.stopListening()

    const socket = socketRef.current;
    socket.send(
        JSON.stringify({
          type: "voice_assistant",
          message: transcript,
        }),
      );
    resetTranscript()
    SpeechRecognition.abortListening()
  }


  return (
    <div className="dashboard-page">
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
          >
            Profile
          </button>

          <div className="dashboard-darkmode">
            <Darkmode />
          </div>

          <button
            type="button"
            className="dashboard-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>


      <div className="dashboard-body">
        {/* Column 1: active users */}
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
              <span>Bin Chat</span>
            </button>
          </div>
        </aside>

        {/* Column 2: chat */}
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
            >
              {isAIChat && isAiLoading ? "Thinking..." : "Send"}
            </button>
          </form>
        </section>

        {/* Column 3: reserved for later */}
        <aside className="dashboard-panel" aria-labelledby="voice-title">
          {/* <div style={{ display: "flex", flexDirection: "column", rowGap: "1rem" }}>
      <Text />
      <div style={{ display: "flex", columnGap: "0.5rem" }}>
        {speechStatus !== "started" ? <button onClick={start}>Start</button> : <button onClick={pause}>Pause</button>}
        <button onClick={stop}>Stop</button>
      </div>
      </div> */}

          <div className="m-auto w-full max-w-lg p-5 text-center sm:p-6">
            <h2 id="voice-title" className="mb-4 text-2xl font-bold">Voice transcription</h2>
            <p role="status" className="mb-6 text-text/70">Microphone: {listening ? "on" : "off"}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={start_audio} disabled={!browserSupportsSpeechRecognition || listening} className="min-h-11 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40">Start</button>
              {/* <button type="button" onClick={end_audio} disabled={!listening} className="min-h-11 rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-40">Stop</button> */}
              <button type="button" onClick={end_audio} disabled={!transcript} className="min-h-11 rounded-lg border border-secondary px-5 py-3 font-semibold transition-colors hover:bg-secondary/20 disabled:opacity-40">Reset</button>
            </div>
            <p aria-live="polite" className="mt-6 max-h-48 min-h-32 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-secondary/50 bg-secondary/10 p-4 leading-relaxed">
              {transcript || "Your speech will appear here."}
            </p>
            {!browserSupportsSpeechRecognition && (
              <p className="mt-4 text-sm text-text/70">This browser does not support speech recognition.</p>
            )}
          </div>
          {/* <div>group msg:</div>
          {
            JSON.stringify(groupMessages)
          }
          <div>aiMessages</div>
          {
            JSON.stringify(aiMessages)

          }
        <div>converstationsl</div>
          {
                        JSON.stringify(conversation)

          } */}
        </aside>
      </div>
    </div>
  );
}


export default Dashboard;
