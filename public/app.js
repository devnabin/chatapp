//Dom Elements Selector
const $form = document.querySelector("#message-form");
const $formButton = document.querySelector("#send-but");
const $formInput = document.querySelector("#msg-field");
const $locationShareBut = document.querySelector("#location-share-but");
//messages
const $messages = document.querySelector("#messages");
const $activeUser = document.querySelector("#addusers");
const $activeRoom = document.querySelector("#addrooms");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const urlTemplate = document.querySelector("#url-template").innerHTML;
const activity = document.querySelector("#user-activity").innerHTML;
const activeUser = document.querySelector("#user-online-templates").innerHTML;
const activeRoom = document.querySelector("#active-room-templates").innerHTML;


//--------- auto scroll
const autoScroll = () => {
  //new message
  const $newMessage = $messages.lastElementChild;


  //height of the new messagec
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // console.log(newMessageStyles)
  // console.log(newMessageMargin);
  // console.log('newMessageHeight' , newMessageHeight);


  //visable height
  const visableHeight = $messages.offsetHeight;
  // console.log('visableHeight' , visableHeight)


  //height of messages container
  const containerHeight = $messages.scrollHeight;
  // console.log('containerHeight' , containerHeight)


  //how far i have scroll
  const scrolloffSet = $messages.scrollTop + visableHeight;
  // console.log('scrolloffSet' , scrolloffSet)


  
  if (containerHeight - newMessageHeight <= scrolloffSet) {
    // console.log(`containerHeight - newMessageHeight <= scrolloffSet`)
    // console.log(containerHeight + '-' + newMessageHeight + '<=' + scrolloffSet)
    // console.log("yes");
    // console.log("both sub", containerHeight - newMessageHeight);
    // console.log( '<=' ,scrolloffSet);
    $messages.scrollTop = $messages.scrollHeight;
    //this one line can keep user down the bottom
  } 
  // else {
  //   console.log("not working");
  //   console.log(`containerHeight - newMessageHeight <= scrolloffSet`)
  //   console.log(containerHeight + '-' + newMessageHeight + '<=' + scrolloffSet)
  //   console.log("both sub", containerHeight - newMessageHeight);

  //   // console.log(scrolloffSet);
  // }
};

// setInterval(() => {
//   autoScroll();
// }, 10000);


// --------- auto scroll />


const socket = io();

//defense code for server emit when user is connected
socket.on("message", ({ username, message, createdAt }) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username,
    message,
    createdAt: moment(createdAt).format("HH:mm a"),
    // for moment visit https://momentjs.com/docs/
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoScroll();
});

socket.on("userActivity", ({ username, message, createdAt }) => {
  let html;
  html = Mustache.render(activity, {
    username,
    message,
    createdAt: moment(createdAt).format("HH:mm a"),
  });
  if (message.includes("left the chat")) {
    html = html.replace("%activitycolor%", "left");
  } else if (message.includes("joined the chat!")) {
    html = html.replace("%activitycolor%", "join");
  }
  $messages.insertAdjacentHTML("beforeend", html);

  autoScroll();
});

socket.on("locationMessage", ({ username, url, createdAt }) => {
  // console.log(url)
  const html = Mustache.render(urlTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("HH:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoScroll();
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
    // console.log("message is delivered");
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
      // console.log("location shared");
    });
  });
});

//===================================================

//options
const userData = Qs.parse(location.search, { ignoreQueryPrefix: true });
socket.emit("join", userData, (log) => {
  if (log) {
    alert(log);
    window.location.href = "/";
  }
});

//socket
let a = 0;

socket.on("roomData", ({ room, users }) => {
  document.querySelector("#groupName").textContent = room;
  const html = Mustache.render(activeUser, {
    users,
  });
  $activeUser.innerHTML = html;
});

socket.on("activeRoom", ({ rooms }) => {
  // rooms = rooms.filter((args) => args !== room);
  let moreRooms = [];
  rooms.forEach((element) => {
    moreRooms.push({ room: element });
  });
  html = Mustache.render(activeRoom, {
    rooms: moreRooms,
  });
  $activeRoom.innerHTML = html;
});
