const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

const Author = require('./models/Author');
const Book = require('./models/Book');
const User = require('./models/User');

const resolvers = {
	Query: {
		bookCount: async () => Book.collection.countDocuments(),
		authorCount: async () => Author.collection.countDocuments(),
		allBooks: async (root, args) => {
			return Book.find({});
		},
		allAuthors: async () => {
			return Author.find({});
		},
		me: (root, args, context) => {
			return context.currentUser;
		},
	},

	Author: {
		// bookCount: (root) => {
		// 	return books.filter((book) => book.author === root.name).length;
		// },
	},

	Mutation: {
		addBook: async (root, args, context) => {
			const currentUser = context.currentUser;
			if (!currentUser) {
				throw new GraphQLError('Not authenticated', {
					extensions: { code: 'UNAUTHENTICATED' },
				});
			}
			const book = new Book({ ...args });

			try {
				await book.save();
			} catch (error) {
				throw new GraphQLError('Saving book failed', {
					extensions: {
						code: 'BAD_USER_INPUT',
						invalidArgs: [args.title, args.author],
						error,
					},
				});
			}
			return book;
		},
		editAuthor: async (root, args, context) => {
			const currentUser = context.currentUser;
			if (!currentUser) {
				throw new GraphQLError('Not authenticated', {
					extensions: { code: 'UNAUTHENTICATED' },
				});
			}

			const author = await Author.findOne({ name: args.name });

			if (!author) return null;

			author.born = args.setBornTo;

			try {
				await author.save();
				currentUser.favoriteGenre = currentUser.favoriteGenre.concat(author);
				await currentUser.save();
			} catch (error) {
				throw new GraphQLError('Saving author failed', {
					extensions: {
						code: 'BAD_USER_INPUT',
						invalidArgs: [args.name, args.born],
						error,
					},
				});
			}
			return author;
		},

		createUser: async (root, args) => {
			const user = new User({
				username: args.username,
				favoriteGenre: args.favoriteGenre,
			});

			try {
				return user.save();
			} catch (error) {
				throw new GraphQLError('Failed to create new user', {
					extensions: {
						code: BAD_USER_INPUT,
						invalidArgs: args.username,
						error,
					},
				});
			}
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username });

			if (!user || args.password !== 'secret') {
				throw new GraphQLError('Wrong credentials', {
					extensions: {
						code: BAD_USER_INPUT,
						invalidArgs: [args.username, args.password],
						error,
					},
				});
			}

			const useForToken = {
				username: user.username,
				id: user._id,
			};

			return { value: jwt.sign(useForToken, process.env.JWT_SECRET) };
		},
	},
};

module.exports = resolvers;
