const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();
document.getElementById('submit-file').addEventListener('click', function () {
  const input = document.querySelector('#avatar');
  var fileReader = new FileReader(),
    slice = input.files[0];
  console.log(slice);
  fileReader.readAsArrayBuffer(slice);
  fileReader.onload = (evt) => {
    var arrayBuffer = fileReader.result;
    console.log(arrayBuffer);
    socket.emit('fileSend', {buffer: arrayBuffer});
  };
});

socket.on('fileReceiver', (buffer) => {
  let arrayBuffer = buffer.buffer.buffer;
  console.log(buffer.buffer.buffer);
  var file = new File([arrayBuffer], 'image.jpg');
  console.log(file);
  let image = URL.createObjectURL(file);
  console.log(image);
  let div = document.getElementById('imgPreview');
  let img = document.createElement('IMG');
  img.setAttribute('src', image);
  img.style.width = "200px"
  img.style.height = "200px"
  div.appendChild(img);
  console.log(div);
});

// Join chatroom
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
  console.log('room', room);
  console.log('user', users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
