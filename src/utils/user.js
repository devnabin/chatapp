//user in array form
const users = [];

//adduser , removeuser , getUser , getUserinRoom , getrooms
//1 , adduser
const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate to the data
  if (!username || !room) {
    return {
      error: "username and room name is required",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "username is already taken",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};


//2. remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};


//3. getuser
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//4. getUserinRoom
const getUserInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};


//5. getrooms
const getRooms = ()=>{
  const rooms = []
  users.forEach(args =>{
    if(!rooms.includes(args.room)){
      rooms.push(args.room)
    }
  })
  return rooms
}

module.exports= {
    addUser , 
    removeUser,
    getUser,
    getUserInRoom,
    getRooms
}


//Testing above 4 functions

//===========
// creating user 
// addUser({ id: 1, username: "nabin", room: "my room" });
// addUser({ id: 2, username: "nasdin", room: "my" });
// addUser({ id: 3, username: "ninja", room: "my room" });
// console.log(users);

//remove user
// removeUser(3)
// console.log(users);

//getuser
// console.log(getUser(2))

//getuserinroom
// console.log(getUserInRoom('my'))


// console.log(users)
// console.log(getRooms())