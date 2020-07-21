const socket = io();

//defense code for server emit when user is connected
socket.on("message", (message) => {
  console.log(message);
});

//defense code for server emit when user send a message
socket.on("msg", (args) => {
  console.log(args);
});

//making emit from browser when we make a event
document.querySelector("#message").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  //Creating emit
  socket.emit("msg", msg);
  e.target.elements.msg.value = "";
});
