import DataLoader from 'dataloader';
import _ from 'lodash';
import Book from './models/Book';
import Author from './models/Author';

export const booksCountLoader = new DataLoader(async (authorIds) => {
	const counts = Book.collection.aggregate([
		{ $match: { author: { $in: authorIds } } },
		{ $group: { _id: '$author', count: { $sum: 1 } } },
	]);
	const countsByAuthorId = _.keyBy(counts, '_id');
	return authorIds.map((authorId) => countsByAuthorId[authorId]?.count || 0);
});

export const authorLoader = new DataLoader(async (authorIds) => {
	const authors = await Author.find({ _id: { $in: authorIds } });
	const authorsById = _.keyBy(authors, '_id');
	return authorIds.map((authorId) => authorsById[authorId] || null);
});

export const booksByGenreLoader = new DataLoader(async (genres) => {
	const books = await Book.find({ genres: { $in: genres } });
	const booksByGenre = {};

	for (const genre of genres) {
		booksByGenre[genre] = [];
	}

	for (const book of books) {
		for (const genre of book.genres) {
			if (booksByGenre.hasOwnProperty(genre)) {
				booksByGenre[genre].push(book);
			}
		}
	}
	return genres.map((genre) => booksByGenre[genre] || []);
});
