//Dom Elements Selector
const $form = document.querySelector("#message-form");
const $formButton = document.querySelector("#send-but");
const $formInput = document.querySelector("#msg-field");
const $locationShareBut = document.querySelector("#location-share-but");

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
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable the send button
  $formButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.msg.value;
  //Creating emit
  socket.emit("msg", msg, (error) => {
    //enable the send button
    $formButton.removeAttribute("disabled");
    //refouse the cursor in input field
    $formInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message is delivered");
  });
  e.target.elements.msg.value = "";
});

$locationShareBut.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your device is not supported geo location");
  }

  //disabling the button
  $locationShareBut.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("location", coords, () => {
      $locationShareBut.removeAttribute("disabled");
      console.log("location shared");
    });
  });
});
