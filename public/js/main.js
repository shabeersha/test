const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

let popupStatus = true;

// Get username and room from URL
const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

document.getElementById('submit-file').addEventListener('click', function () {
  document.getElementById('avatar').click();
});

document.getElementById('avatar').addEventListener('change', function () {
  document.getElementById('popupOption').style.display = 'none';
  const input = document.querySelector('#avatar');
  var fileReader = new FileReader(),
    slice = input.files[0];
  console.log(slice);
  fileReader.readAsArrayBuffer(slice);
  fileReader.onload = (evt) => {
    var arrayBuffer = fileReader.result;
    console.log(arrayBuffer);
    socket.emit('fileSend', {buffer: arrayBuffer, type: slice.type});
  };
});

socket.on('fileReceiver', (buffer) => {
  console.log(buffer);
  let arrayBuffer = buffer.text.buffer.buffer;
  console.log(buffer.text.buffer.buffer);
  console.log(buffer.text.buffer.type);
  let type = buffer.text.buffer.type;
  var file = new File([arrayBuffer], 'image.jpg');
  console.log(file);
  if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
    let image = URL.createObjectURL(file);
    console.log(image);
    let div = document.createElement('DIV');
    const p = document.createElement('p');
    div.classList.add('message');
    p.classList.add('meta');
    p.innerText = buffer.username;
    p.innerHTML += `<span>${buffer.time}</span>`;
    div.appendChild(p);
    let img = document.createElement('IMG');
    img.setAttribute('src', image);
    img.style.width = '100px';
    img.style.height = '100px';
    div.appendChild(img);
    document.querySelector('.chat-messages').appendChild(div);
    console.log(div);
  } else if (
    type === 'video/x-matroska' ||
    type === 'video/webm' ||
    type === 'video/mp4'
  ) {
    let videoFile = URL.createObjectURL(file);
    // let div = document.getElementById('videoPreview');
    let parentDiv = document.getElementById('chat-messages');
    let childDiv = document.createElement('DIV');
    const p = document.createElement('p');
    childDiv.classList.add('message');
    p.classList.add('meta');
    p.innerText = buffer.username;
    p.innerHTML += `<span>${buffer.time}</span>`;
    childDiv.appendChild(p);
    let video = document.createElement('video');
    video.style.width = '200px';
    video.style.height = '200px';
    video.src = videoFile;
    video.autoplay = true;
    childDiv.appendChild(video);
    parentDiv.appendChild(childDiv);
    console.log(div);
  }
  //    else if (type === 'video/webm') {
  //     let videoFile = URL.createObjectURL(file);
  //     let div = document.getElementById('videoPreview');
  //     let video = document.createElement('video');
  //     video.style.width = '200px';
  //     video.style.height = '200px';
  //     video.src = videoFile;
  //     video.autoplay = true;
  //     div.appendChild(video);
  //     console.log(div);
  //   }
  else if (type === 'audio') {
    let audioFile = URL.createObjectURL(file);
    console.log('Audio process!!!', audioFile);
    let parentDiv = document.getElementById('chat-messages');
    let childDiv = document.createElement('DIV');
    const p = document.createElement('p');
    childDiv.classList.add('message');
    p.classList.add('meta');
    p.innerText = buffer.username;
    p.innerHTML += `<span>${buffer.time}</span>`;
    childDiv.appendChild(p);
    let audio = document.createElement('audio');
    audio.src = audioFile;
    audio.controls = 'controls';
    childDiv.appendChild(audio);
    parentDiv.appendChild(childDiv);
    console.log(parentDiv);
  } else {
    let audioFile = URL.createObjectURL(file);
    let div = document.getElementById('audioPreview');
    // let div = document.createElement('DIV');
    const p = document.createElement('p');
    div.classList.add('message');
    p.classList.add('meta');
    p.innerText = buffer.username;
    p.innerHTML += `<span>${buffer.time}</span>`;
    div.appendChild(p);
    let audio = document.createElement('audio');
    audio.src = audioFile;
    audio.controls = 'controls';
    div.appendChild(audio);
    console.log(div);
  }
});

//===============================================================================

// The item (or items) to press and hold on

navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];
  mediaRecorder.addEventListener('dataavailable', (event) => {
    audioChunks.push(event.data);
  });

  mediaRecorder.addEventListener('stop', async () => {
    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    var bufferPromise = await audioBlob.arrayBuffer();
    socket.emit('fileSend', {buffer: bufferPromise, type: 'audio'});
  });
  //===================Press Button Event =======================
  let item = document.querySelector('#item');
  let timerID;
  let counter = 0;
  let pressHoldEvent = new CustomEvent('pressHold');
  let pressHoldDuration = 50;

  // Listening for the mouse and touch events
  item.addEventListener('mousedown', pressingDown, false);
  item.addEventListener('mouseup', notPressingDown, false);
  item.addEventListener('mouseleave', notPressingDown, false);
  item.addEventListener('touchstart', pressingDown, false);
  item.addEventListener('touchend', notPressingDown, false);

  // Listening for our custom pressHold event
  item.addEventListener('pressHold', doSomething, false);

  function pressingDown(e) {
    // Start the timer
    requestAnimationFrame(timer);

    e.preventDefault();

    console.log('Pressing!');
  }

  function notPressingDown(e) {
    // Stop the timer
    cancelAnimationFrame(timerID);
    counter = 0;
    mediaRecorder.stop();
    console.log('Not pressing!');
  }

  //
  // Runs at 60fps when you are pressing down
  //
  function timer() {
    console.log('Timer tick!');

    if (counter < pressHoldDuration) {
      timerID = requestAnimationFrame(timer);
      counter++;
    } else {
      console.log('Press threshold reached!');
      item.dispatchEvent(pressHoldEvent);
    }
  }

  function doSomething(e) {
    mediaRecorder.start();
    console.log('pressHold event fired!');
  }

  //=============================================
});

//==============================================================================

//===================================================================================

const recordAudio = () => {
  return new Promise((resolve) => {
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      const start = () => {
        mediaRecorder.start();
      };

      const stop = () => {
        return new Promise((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            const play = () => {
              audio.play();
            };

            resolve({audioBlob, audioUrl, play});
          });

          mediaRecorder.stop();
        });
      };

      resolve({start, stop});
    });
  });
};

let startEvt = document.getElementById('start');
let stopEvt = document.getElementById('stop');

startEvt.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const audioChunks = [];
    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', async () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      var bufferPromise = await audioBlob.arrayBuffer();
      socket.emit('fileSend', {buffer: bufferPromise, type: 'audio'});
    });
    stopEvt.addEventListener('click', () => {
      mediaRecorder.stop();
    });
  });
});

//===============================================================================
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

socket.on('oldmessage', (message) => {
	console.log(message);
	message.forEach((element) => {
		outputMessage(element);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	});
	// Scroll down
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('text button');
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
//===================================================================

document.getElementById('popup').addEventListener('click', () => {
  console.log('popup');
  if (popupStatus) {
    console.log('true');

    document.getElementById('popupOption').style.display = 'grid';
    // console.log(document.getElemgntById('popupOption'));

    popupStatus = false;
  } else {
    console.log('false');
    document.getElementById('popupOption').style.display = 'none';
    // console.log(document.getElementById('popupOption'));
    popupStatus = true;
  }
});
