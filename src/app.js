const path = require("path");
const express = require("express");
const http = require("http");
const Filter = require("bad-words");

//shocket io library import
const shocketio = require("socket.io");

const app = express();

//Serving static files
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

//Serving index html file
app.get("/", (req, res) => {
  res.render("index");
});

//creating new server and passing app
const server = http.createServer(app);
const io = shocketio(server);

//all the logic of socket is here
//io.on is the main method of all to make connection
io.on("connection", (socket) => {
  console.log("user is connected");
  /*
  tips:-
  -->servers emit then from frontend we have to use socket.on method
  -->but when frontend emit we have to user secket.on method on server
*/

  //Server emit
  socket.emit("message", "welcome to the chat");
  socket.broadcast.emit("message", "A user is joined");

  //defense code when browser emit
  socket.on("msg", (arg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(arg)) {
      return callback("profane is not allowed");
    }

    io.emit("msg", arg);
    callback();
  });

  //defense code for location
  socket.on("location", (cords, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${cords.latitude},${cords.longitude}`
    );
    callback();
  });

  //user user disconnet or close the browser
  socket.on("disconnect", () => {
    io.emit("message", "A user is disconnected");
  });
  /* 
tips :-
1. socket.emit for the perticular user
2. io.emit for sending to everone
3. socket.brocast.emit for all user expect that perticular user
*/

  /* 
tips :-
Acknowledgements is simple as call back
*/
});

//listing server on port 3000
server.listen(3000, () => {
  console.log("app lis listern");
});