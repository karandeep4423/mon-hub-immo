import { SearchAd } from './searchAd';

export type CreateSearchAdPayload = Omit<
	SearchAd,
	'_id' | 'authorId' | 'createdAt' | 'updatedAt'
> & {
	authorId: string;
};
