const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const AWS = require('aws-sdk');
var fs =  require('fs');



const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Mongo Client Connection

const state = {
	db: null
};

Mongo.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }).then((db) => {
	console.log('Connected to database');
	state.db = db;
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

		// Welcome current user
		socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
		state.db
			.db('MSG')
			.collection('message')
			.find({
				room: user.room
			})
			.toArray()
			.then((res) => {
				console.log(res);
				socket.emit('oldmessage', res);
			});

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
//========================================================


socket.on('fileSend',async (buffer) => {
    try {
//=================AWS=======================================		
await AWS.config.update({
	accessKeyId: 'AKIAILH5LVLLYIKPBKUQ',
	secretAccessKey: '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',
	region: 'ap-south-1'
});
fs.writeFile("/home/test.mp4", buffer.buffer, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

var s3 = new AWS.S3();
var myBucket = 'chatbucket007';
var myKey = `${new ObjectId()}`;
params = { Bucket: myBucket, Key: myKey, Body: buffer.buffer, ACL: 'public-read' };
s3.putObject(params, function(err, data) {
	if (err) {
		console.log(err);
	} else {
		const user = getCurrentUser(socket.id);
	    const message = formatMessage(user.username, `https://chatbucket007.s3.ap-south-1.amazonaws.com/${myKey}`);
	state.db
		.db('MSG')
		.collection('message')
		.insertOne({
			room: user.room,
			username: message.username,
			text: null,
			time: message.time,
			url:`https://chatbucket007.s3.ap-south-1.amazonaws.com/${myKey}`,
			type:buffer.type
			
		})
		.then((res) => {
			console.log('Inserted into db');
		});
		console.log('Successfully uploaded data to myBucket/myKey');
	//==================EMITER====================================
	
	console.log(user);
	console.log(buffer);
	io.to(user.room).emit(
	'fileReceiver',
	formatMessage(user.username, {buffer: buffer})
	);
//=======================================================
	
	
	}
});
	} catch (error) {
		console.log(error)
	}
  });







//==========================================================
  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
	console.log(user);
	const message = formatMessage(user.username, msg);
		state.db
			.db('MSG')
			.collection('message')
			.insertOne({
				room: user.room,
				username: message.username,
				text: message.text,
				time: message.time
			})
			.then((res) => {
				console.log('Inserted into db');
			});
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
