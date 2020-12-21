const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
// const AWS = require('aws-sdk');
var fs = require('fs');
const FileType = require('file-type');
const { v4: uuid } = require('uuid');



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
	socket.on('joinRoom', ({ username, room }) => {
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


	socket.on('fileSend', async (buffer) => {
		try {
			//=================AWS=======================================		

			// fs.writeFile("/home/test.mp4", buffer.buffer, function(err) {
			//     if(err) {
			//         return console.log(err);
			//     }
			//     console.log("The file was saved!");
			// }); 

			console.log('----------------------------------------------------------')
			var fileName = uuid();
			var user = getCurrentUser(socket.id)
			var message = formatMessage(user.username, buffer);

			console.log(buffer)

			console.log(await FileType.fromBuffer(buffer.buffer));
			var type = await FileType.fromBuffer(buffer.buffer);
			console.log(type.ext, "type")
			switch (type.ext) {
				case 'jpg': console.log("its jpg Done");

					console.log(user, message)

					fs.writeFile('./public/media/images/' + fileName + '.jpg', buffer.buffer, (err) => {
						if (err) {
							console.log("file save error", err)
						} else {

							state.db
								.db('MSG')
								.collection('message')
								.insertOne({
									room: user.room,
									username: message.username,
									text: null,
									time: message.time,
									url: '/media/images/' + fileName + '.jpg',
									type: buffer.type

								})
								.then((res) => {
									console.log('Inserted into db file');
								});
							console.log(user);
							console.log(buffer);
							io.to(user.room).emit(
								'fileReceiver',
								formatMessage(user.username, { buffer: buffer })
							);
						}
					})
					break;
				case 'png': console.log("png Done");
					console.log(user, message)

					fs.writeFile('./public/media/images/' + fileName + '.png', buffer.buffer, (err) => {
						if (err) {
							console.log("file save error", err)
						} else {

							state.db
								.db('MSG')
								.collection('message')
								.insertOne({
									room: user.room,
									username: message.username,
									text: null,
									time: message.time,
									url: '/media/images/' + fileName + '.png',
									type: buffer.type

								})
								.then((res) => {
									console.log('Inserted into db file');
								});
							console.log(user);
							console.log(buffer);
							io.to(user.room).emit(
								'fileReceiver',
								formatMessage(user.username, { buffer: buffer })
							);
						}
					})
					break;
				case 'mp4': console.log("mp4 Done");
					console.log(user, message)

					fs.writeFile('./public/media/videos/' + fileName + '.mp4', buffer.buffer, (err) => {
						if (err) {
							console.log("file save error", err)
						} else {

							state.db
								.db('MSG')
								.collection('message')
								.insertOne({
									room: user.room,
									username: message.username,
									text: null,
									time: message.time,
									url: '/media/videos/' + fileName + '.mp4',
									type: buffer.type

								})
								.then((res) => {
									console.log('Inserted into db file');
								});
							console.log(user);
							console.log(buffer);
							io.to(user.room).emit(
								'fileReceiver',
								formatMessage(user.username, { buffer: buffer })
							);
						}
					})
					break;
				case 'mp3': console.log("mp3 done");
					console.log(user, message)

					fs.writeFile('./public/media/audios/' + fileName + '.mp3', buffer.buffer, (err) => {
						if (err) {
							console.log("file save error", err)
						} else {

							state.db
								.db('MSG')
								.collection('message')
								.insertOne({
									room: user.room,
									username: message.username,
									text: null,
									time: message.time,
									url: '/media/audios/' + fileName + '.mp3',
									type: buffer.type

								})
								.then((res) => {
									console.log('Inserted into db file');
								});
							console.log(user);
							console.log(buffer);
							io.to(user.room).emit(
								'fileReceiver',
								formatMessage(user.username, { buffer: buffer })
							);
						}
					})
					break;
				default: console.log("default");
			}

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
				console.log('Inserted into db text');
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
