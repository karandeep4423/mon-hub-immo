import mongoose, { Document, Schema } from 'mongoose';

export interface IUserFavoriteSearchAd extends Document {
	userId: mongoose.Types.ObjectId;
	searchAdId: mongoose.Types.ObjectId;
	createdAt: Date;
}

const userFavoriteSearchAdSchema = new Schema<IUserFavoriteSearchAd>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, "L'ID utilisateur est requis"],
		},
		searchAdId: {
			type: Schema.Types.ObjectId,
			ref: 'SearchAd',
			required: [true, "L'ID de la recherche client est requis"],
		},
	},
	{
		timestamps: true,
	},
);

// Indexes to prevent duplicates and speed up queries
userFavoriteSearchAdSchema.index(
	{ userId: 1, searchAdId: 1 },
	{ unique: true },
);
userFavoriteSearchAdSchema.index({ userId: 1, createdAt: -1 });
userFavoriteSearchAdSchema.index({ searchAdId: 1 });

export const UserFavoriteSearchAd = mongoose.model<IUserFavoriteSearchAd>(
	'UserFavoriteSearchAd',
	userFavoriteSearchAdSchema,
);
