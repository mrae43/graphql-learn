const { GraphQLError, subscribe } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const jwt = require('jsonwebtoken');

const Author = require('./models/Author');
const Book = require('./models/Book');
const User = require('./models/User');

const pubsub = new PubSub();

const resolvers = {
	Query: {
		bookCount: async (root) => {
			return Book.collection.countDocuments({ author: root._id });
		},
		authorCount: async (root) => {
			return Author.collection.countDocuments({ author: root._id });
		},
		allBooks: async (root, args) => {
			const filter = args.genres ? { genre: args.genre } : {};
			return Book.find(filter).populate('author');
		},
		allAuthors: async () => {
			return Author.find({});
		},
		me: (root, args, context) => {
			return context.currentUser;
		},
	},

	Author: {
		bookCount: async (root) => {
			return Book.countDocuments({ author: root._id });
		},
	},

	Mutation: {
		addBook: async (root, args, context) => {
			const currentUser = context.currentUser;
			if (!currentUser) {
				throw new GraphQLError('Not authenticated', {
					extensions: { code: 'UNAUTHENTICATED' },
				});
			}

			let author = await Author.findOne({ name: args.author });

			if (!author) {
				author = new Author({ name: args.author });
				try {
					await author.save();
				} catch (error) {
					throw new GraphQLError('Saving author failed', {
						extensions: {
							code: 'BAD_USER_INPUT',
							invalidArgs: [args.author],
							error,
						},
					});
				}
			}

			const book = new Book({
				title: args.title,
				published: args.published,
				genres: args.genres,
				author: author._id,
			});

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
			const populatedBook = await book.populate('author');
			pubsub.publish('BOOK_ADDED', { bookAdded: book });
			return populatedBook;
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
	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
		},
	},
};

module.exports = resolvers;
