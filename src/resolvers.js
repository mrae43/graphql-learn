const { GraphQLError } = require('graphql');

const Author = require('./models/Author');
const Book = require('./models/Book');

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
	},

	Author: {
		// bookCount: (root) => {
		// 	return books.filter((book) => book.author === root.name).length;
		// },
	},

	Mutation: {
		addBook: async (root, args) => {
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
		editAuthor: async (root, args) => {
			const author = await Author.findOne({ name: args.name });

			if (!author) return null;

			author.born = args.setBornTo;

			try {
				await author.save();
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
	},
};

module.exports = resolvers;
