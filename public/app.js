//Dom Elements Selector
const $form = document.querySelector("#message-form");
const $formButton = document.querySelector("#send-but");
const $formInput = document.querySelector("#msg-field");
const $locationShareBut = document.querySelector("#location-share-but");
//messages
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const urlTemplate = document.querySelector("#url-template").innerHTML;

const socket = io();

//defense code for server emit when user is connected
socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    message,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
  // console.log(url)
  const html = Mustache.render(urlTemplate, {
    url,
  });
  $messages.insertAdjacentHTML("beforeend", html);
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
