const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	published: {
		type: Number,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	genres: {
		type: [String],
		required: true,
	},
});

module.exports = mongoose.model('Book', schema);
