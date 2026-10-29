import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./Chat.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import VoicePanel from "./VoicePanel";

// talk
import { useSpeech } from "react-text-to-speech";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";
// language for voice input and spoken replies (BCP 47 code, e.g. "en-US", "hi-IN")
const VOICE_LANGUAGE = "en-US";

function Chat() {
  const { username } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const voiceActionRef = useRef(false);

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
  const [isVoiceBusy, setIsVoiceBusy] = useState(false);

  // remove this
  const [ai_response, setAi_response] = useState("");

  // talk
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const browserSupportsTextToSpeech = typeof window !== "undefined"
    && Boolean(window.speechSynthesis)
    && typeof window.SpeechSynthesisUtterance === "function";

  const {
    isInQueue,
    start,
    stop, // Function to stop the speech or remove it from queue
  } = useSpeech({
    text: ai_response,
    stableText: true, // Enable if 'text' is stable across renders for better performance
    lang: VOICE_LANGUAGE,
  });

  const [isAutoSpeaking, setIsAutoSpeaking] = useState(false);

  // speak each new AI reply automatically with the native API; the library swallows speech errors silently
  useEffect(() => {
    if (!browserSupportsTextToSpeech || !ai_response || listening) return;

    const utterance = new SpeechSynthesisUtterance(ai_response);
    utterance.lang = VOICE_LANGUAGE;
    utterance.onstart = () => setIsAutoSpeaking(true);
    utterance.onend = () => setIsAutoSpeaking(false);
    utterance.onerror = (event) => {
      setIsAutoSpeaking(false);
      console.error("Auto-play speech failed:", event.error);
    };

    // cancel first: Chrome's speech engine can get stuck after the mic stops
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai_response]);

  function stop_speech() {
    stop();
    window.speechSynthesis?.cancel();
    setIsAutoSpeaking(false);
  }



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
          // backend sends { message: { reply: "..." } }
          const reply = typeof receivedData.message === "string"
            ? receivedData.message
            : receivedData.message?.reply;
          if (typeof reply === "string" && reply.trim()) {
            setAi_response(reply.trim());
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
        const reply = typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "I could not generate a response.";

        setAiMessages((currentMessages) => [
          ...currentMessages,
          {
            sender: "Bin Chat",
            message: reply,
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
    navigate(`/chat/${encodeURIComponent(username)}`);
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

  async function start_audio(){
    if (voiceActionRef.current || listening || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      return;
    }

    voiceActionRef.current = true;
    setIsVoiceBusy(true);

    try {
      stop_speech();
      setAi_response("");
      resetTranscript();
      await SpeechRecognition.startListening({
        continuous: browserSupportsContinuousListening,
        language: VOICE_LANGUAGE,
      });
    } catch (error) {
      console.error("Could not start voice recording:", error);
    } finally {
      voiceActionRef.current = false;
      setIsVoiceBusy(false);
    }
  }

  async function end_audio(sendMessage = true){
    if (voiceActionRef.current) { return; }

    const voiceMessage = transcript.trim();
    if (sendMessage && !voiceMessage) { return; }

    const socket = socketRef.current;
    if (sendMessage && (!socket || socket.readyState !== WebSocket.OPEN)) {
      console.error("WebSocket is not connected");
      return;
    }

    voiceActionRef.current = true;
    setIsVoiceBusy(true);

    try {
      if (listening) {
        await SpeechRecognition.abortListening();
      }

      if (sendMessage) {
        if (socket.readyState !== WebSocket.OPEN) {
          console.error("WebSocket is not connected");
          return;
        }
        socket.send(
          JSON.stringify({
            type: "voice_assistant",
            message: voiceMessage,
          }),
        );
      }
      resetTranscript();
    } catch (error) {
      console.error("Could not finish voice recording:", error);
    } finally {
      voiceActionRef.current = false;
      setIsVoiceBusy(false);
    }
  }


  return (
    <div className="dashboard-page">
      <Navbar
        handleDashboardNavigation={handleDashboardNavigation}
        username={username}
        isConnected={isConnected}
        handleProfileNavigation={handleProfileNavigation}
        handleLogout={handleLogout}
      />


      <div className="dashboard-body">
        {/* Column 1: active users */}
        <Sidebar
          contacts={contacts}
          recipient={recipient}
          handleSelectUser={handleSelectUser}
          isGroupChat={isGroupChat}
          handleSelectGroup={handleSelectGroup}
          isAIChat={isAIChat}
          handleSelectAI={handleSelectAI}
        />

        {/* Column 2: chat */}
        <ChatWindow
          recipient={recipient}
          isGroupChat={isGroupChat}
          isAIChat={isAIChat}
          chatTitle={chatTitle}
          displayedMessages={displayedMessages}
          username={username}
          isAiLoading={isAiLoading}
          handleSubmit={handleSubmit}
          message={message}
          messagePlaceholder={messagePlaceholder}
          canSendMessage={canSendMessage}
          setMessage={setMessage}
          isConnected={isConnected}
        />

        {/* Column 3: reserved for later */}
        <VoicePanel
          listening={listening}
          ai_response={ai_response}
          browserSupportsTextToSpeech={browserSupportsTextToSpeech}
          isInQueue={isInQueue}
          isAutoSpeaking={isAutoSpeaking}
          stop_speech={stop_speech}
          start={start}
          isVoiceBusy={isVoiceBusy}
          start_audio={start_audio}
          end_audio={end_audio}
          transcript={transcript}
          isConnected={isConnected}
          browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
          isMicrophoneAvailable={isMicrophoneAvailable}
        />
      </div>
    </div>
  );
}


export default Chat;
