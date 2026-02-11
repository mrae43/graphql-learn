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
			await book.save();
			return book;
		},
		editAuthor: (root, args) => {
			// const author = Author.find((author) => author.name === args.name);
			// if (!author) return null;
			// const updatedData = { ...author, born: args.setBornTo };
			// Author = Author.map((author) =>
			// 	author.name === args.name ? updatedData : author,
			// );
			// return updatedData;
			return null;
		},
	},
};

module.exports = resolvers;
