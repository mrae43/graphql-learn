require('dotenv').config();

const startServer = require('./src/server');

const PORT = process.env.PORT || 4000;

startServer(PORT);
