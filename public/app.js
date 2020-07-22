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
  socket.emit("msg", msg , (error)=>{
    if(error){
      return console.log(error)
    }
    console.log('message is delivered')
  });
  e.target.elements.msg.value = "";
});

document.querySelector("#location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your device is not supported geo location");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("location", coords, ()=> console.log("location shared"));
  });
});
