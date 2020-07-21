const path = require("path");
const express = require("express");
const http = require("http");
//shocket io
const shocketio = require("socket.io");

app = express();

//creating new server and passing app
const server = http.createServer(app);
const io = shocketio(server);

const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.render("index");
});



io.on("connection", (socket) => {
  console.log("user is connected");
  socket.emit("welcome", "welcome to the chat");

  socket.on('msg' ,(arg)=>{
      io.emit('msg' , arg)
  })
});


server.listen(3000, () => {
  console.log("app lis listern");
});
