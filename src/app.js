const path = require("path");
const express = require("express");
const http = require("http");
const Filter = require("bad-words");

//custome modules
const {
  message: generateMessage,
  url: generateUrl,
} = require("./utils/message");

const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
  getRooms,
} = require("./utils/user");

const PORT = process.env.PORT || 3000;

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

  //========================= rooms  =====================================================
  //========================= rooms  =====================================================
  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    /*
here we have till now :-
1. socket.emit for specific
2. io.emit for all user and
3. socket.brocast.emit for all user except spcific one
/\/\/\/\/\/\/\/\/\/\/\/\ *********************************
now we are using rooms in sockets so we have more on the list
1. io.to.emit for all user at that room
2. socket.brocast.to.emit this is for all user except specific one in the room 
*/

    //Server emit
    socket.emit(
      "message",
      generateMessage(
        user.username,
        `Hello ${user.username} Welcome to the chat!`
      )
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "userActivity",
        generateMessage(user.username, `${user.username} joined the chat!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
      rooms: getRooms(),
    });

    io.emit("activeRoom", {
      rooms: getRooms(),
    });

    callback();
  });

  //========================= rooms  =====================================================
  //========================= rooms  =====================================================

  //defense code when browser emit
  socket.on("msg", (arg, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(arg)) {
      return callback("profane is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, arg));
    callback();
  });

  //defense code for location
  socket.on("location", (cords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateUrl(
        user.username,
        `https://google.com/maps?q=${cords.latitude},${cords.longitude}`
      )
    );
    callback();
  });

  //user user disconnet or close the browser
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "userActivity",
        generateMessage(user.username, ` ${user.username} left the chat`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });

      io.emit("activeRoom", {
        rooms: getRooms(),
      });
    }
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
server.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
