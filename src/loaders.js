const DataLoader = require('dataloader');
const _ = require('lodash');
const Book = require('./models/Book');
const Author = require('./models/Author');

const booksCountLoader = new DataLoader(async (authorIds) => {
	const counts = await Book.aggregate([
		{ $match: { author: { $in: authorIds } } },
		{ $group: { _id: '$author', count: { $sum: 1 } } },
	]);
	const countsByAuthorId = _.keyBy(counts, '_id');
	return authorIds.map((authorId) => countsByAuthorId[authorId]?.count || 0);
});

const authorLoader = new DataLoader(async (authorIds) => {
	const authors = await Author.find({ _id: { $in: authorIds } });
	const authorsById = _.keyBy(authors, '_id');
	return authorIds.map((authorId) => authorsById[authorId] || null);
});

module.exports = {
	booksCountLoader,
	authorLoader,
};
