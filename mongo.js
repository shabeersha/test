const Mongo = require('mongodb').MongoClient;

const state = {
	db: null
};

Mongo.connect('mongodb://127.0.0.1:27017').then((db) => {
	state.db = db;
});
