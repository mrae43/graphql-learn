const mongoose = require('mongoose');

const connectToDatabase = async (uri) => {
	console.log('connecting to database URI: ', uri);

	try {
		await mongoose.connect(uri);
	} catch (error) {
		console.log('error connection to MongoDB', error.message);
		process.exit(1);
	}
};

module.exports = connectToDatabase;
