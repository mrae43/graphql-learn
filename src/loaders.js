import DataLoader from 'dataloader';
import _ from 'lodash';
import Book from './models/Book';

export const booksCountLoader = new DataLoader(async (authorIds) => {
	const counts = await Book.collection.aggregate([
		{ $match: { author: { $in: authorIds } } },
		{ $group: { _id: '$author', count: { $sum: 1 } } },
	]);
	const countsByAuthorId = _.keyBy(counts, '_id');
	return authorIds.map((authorId) => countsByAuthorId[authorId]?.count || 0);
});
