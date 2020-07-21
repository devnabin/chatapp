const socket = io();

socket.on("welcome", (args) => {
  console.log("hey", args);
});

socket.on("msg", (args) => {
  console.log(args);
});

document.querySelector("#message").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("msg", msg);
  e.target.elements.msg.value = ''
});
