import mongoose, { Document, Schema } from 'mongoose';

export interface IUserFavorite extends Document {
	userId: mongoose.Types.ObjectId;
	propertyId: mongoose.Types.ObjectId;
	createdAt: Date;
}

const userFavoriteSchema = new Schema<IUserFavorite>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, "L'ID utilisateur est requis"],
		},
		propertyId: {
			type: Schema.Types.ObjectId,
			ref: 'Property',
			required: [true, "L'ID de la propriété est requis"],
		},
	},
	{
		timestamps: true,
	},
);

// Create compound index to prevent duplicate favorites and optimize queries
userFavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
userFavoriteSchema.index({ userId: 1, createdAt: -1 }); // For user favorites list
userFavoriteSchema.index({ propertyId: 1 }); // For favorite count

export const UserFavorite = mongoose.model<IUserFavorite>(
	'UserFavorite',
	userFavoriteSchema,
);
