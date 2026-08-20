import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function Dashboard() {
  const { username } = useParams();

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Open one connection when the dashboard loads
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/${encodeURIComponent(username)}`,
    );

    socketRef.current = socket;

    // The dashboard is now connected to FastAPI
    socket.onopen = () => {
      console.log("Dashboard connected to the server");
      setIsConnected(true);

      // This is a server event, not a chat message
      socket.send(JSON.stringify({
        type: "ping",
      }));
    };

    // Receive future notifications and chat events
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "pong") {
        console.log("Server connection is working");
      }

      if (data.type === "private_message") {
        console.log("Private message:", data);
      }

      if (data.type === "group_message") {
        console.log("Group message:", data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Dashboard disconnected");
      setIsConnected(false);
    };

    // Close the connection when leaving the dashboard
    return () => {
      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [username]);

  return (
    <main>
      <h1>Welcome, {username}</h1>

      <p>
        Server status: {isConnected ? "Connected" : "Disconnected"}
      </p>

      {/* Add dashboard components here later */}
    </main>
  );
}

export default Dashboard;




// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// import "./test.css";

// function Dashboard() {
//   // Get the username from /dashboard/:username
//   const { username } = useParams();

//   // Create the client ID only once
//   // const [username] = useState(() => Date.now());

//   // Store the message currently typed by the user
//   const [message, setMessage] = useState("");

//   // Store all messages received from the backend
//   const [messages, setMessages] = useState([]);

//   // Store the WebSocket connection without causing a re-render
//   const socketRef = useRef(null);

//   // Store the current connection status
//   const [isConnected, setIsConnected] = useState(false);

//   const navigate = useNavigate();

//   function handleLogout() {
//     socketRef.current?.close();
//     localStorage.removeItem("accessToken");
//     navigate("/login", { replace: true });
//   }

//   useEffect(() => {
//     // Create the WebSocket connection when the dashboard opens
//     if(localStorage.getItem("accessToken") != username ) return console.info("not a user")
//     const socket = new WebSocket(
//       `ws://127.0.0.1:8000/ws/${username}`,
//     );

//     socketRef.current = socket;

//     // This function runs after connecting to the backend
//     socket.onopen = () => {
//       console.log("Connected to the WebSocket server");
//       setIsConnected(true);
//     };

//     // This function receives messages from the backend
//     socket.onmessage = (event) => {
//       try {
//         const receivedMessage = JSON.parse(event.data);
//         // Add the new message without removing previous messages
//         setMessages((currentMessages) => [
//           ...currentMessages,
//           receivedMessage,
//         ]);

//         console.log(receivedMessage)
//         console.log(message)
//       } catch (error) {
//         console.error("The backend did not send valid JSON:", error);
//       }
//     };

//     // This function runs if a WebSocket error happens
//     socket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     // This function runs when the connection closes
//     socket.onclose = () => {
//       console.log("WebSocket connection closed");
//       setIsConnected(false);
//       socketRef.current = null;
//     };

//     // Close the WebSocket when the user leaves the dashboard
//     return () => {
//       socket.close();
//       socketRef.current = null;
//       // localStorage.removeItem('accessToken');
//       // console.log('from return close', username)

//     };
//   }, [username]);

//   // Send the typed message to the backend
//   function sendMessage() {
//     const socket = socketRef.current;
//     const cleanedMessage = message.trim();

//     // Do not send an empty message
//     if (!cleanedMessage) {
//       return;
//     }

//     // Make sure the WebSocket is connected
//     if (!socket || socket.readyState !== WebSocket.OPEN) {
//       console.error("WebSocket is not connected");
//       return;
//     }

//     // Send only the message because username is already in the WebSocket URL
//     socket.send(cleanedMessage);

//     // Clear the input after sending
//     setMessage("");
//   }

//   // Send the message when the user submits the form
//   function handleSubmit(event) {
//     event.preventDefault();
//     sendMessage();
//   }

//   return (
//     <main>
//       <h1>Welcome, {username}!</h1>
//       <p>You are logged in to BinChat.</p>
// <button type="button" onClick={handleLogout}>
//   Logout
// </button>
//       <section>
//         <h2>Chat</h2>
//         <p>Your client ID: {username}</p>
//         <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>

//         <div>
//           {messages.map((chatMessage, index) => {
//             const isMyMessage =
//               String(chatMessage.username) === String(username);

//             return (
//               <div
//                 key={`${chatMessage.username}-${index}`}
//                 className={
//                   isMyMessage
//                     ? "my-message-container"
//                     : "another-message-container"
//                 }
//               >
//                 <div
//                   className={
//                     isMyMessage ? "my-message" : "another-message"
//                   }
//                 >
//                   <p>
//                     {isMyMessage
//                       ? `You (${username})`
//                       : `Client ID: ${chatMessage.username}`}
//                   </p>

//                   <p>{chatMessage.message}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Chat message..."
//             value={message}
//             onChange={(event) => setMessage(event.target.value)}
//           />

//           <button
//             type="submit"
//             disabled={!isConnected || !message.trim()}
//           >
//             Send
//           </button>
//         </form>
//       </section>
//     </main>
//   );
// }

// export default Dashboard;