const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const {
	ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const express = require('express');
const { makeExecuteableSchema } = require('@graphql-tools/schema');
const http = require('http');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const getUserFromAuthHeader = async (auth) => {
	if (!auth || !auth.startsWith('Bearer ')) {
		return null;
	}

	const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
	return User.findById(decodedToken.id);
};

const startServer = async (port) => {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		schema: makeExecuteableSchema({ typeDefs, resolvers }),
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await server.start();

	app.use(
		'/',
		cors(),
		express.json(),
		expressMiddleware(server, {
			context: async ({ req }) => {
				const auth = req.headers.authorization;
				const currrentUser = getUserFromAuthHeader(auth);
				return { currrentUser };
			},
		}),
	);

	httpServer.listen(port, () =>
		console.log(`Server is running on http://localhost:${port}`),
	);
};

module.exports = startServer;
