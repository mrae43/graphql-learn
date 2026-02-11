const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	born: {
		type: Number,
		required: false,
	},
});

module.exports = mongoose.model('Author', schema);
