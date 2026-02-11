const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const startServer = (port) => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});

	startStandaloneServer(server, {
		listen: { port },
		context: async ({ req }) => {
			const auth = req?.headers?.authorization;
			if (!auth || auth.toLocaleLowerCase().startsWith('bearer')) {
				return {};
			}

			const token = auth.substring(7);

			try {
				const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
				const currentUser = await User.findById(decodedToken.id);
				return { currentUser };
			} catch (error) {
				return {};
			}
		},
	}).then(({ url }) => {
		console.log(`Server ready at ${url}`);
	});
};

module.exports = startServer;
