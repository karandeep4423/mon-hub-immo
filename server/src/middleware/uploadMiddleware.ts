import multer from 'multer';
import { Request } from 'express';

interface MulterRequest extends Request {
	user?: {
		id: string;
		userType: string;
	};
}

const storage = multer.memoryStorage();

const fileFilter = (
	req: MulterRequest,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.',
			),
		);
	}
};

const limits = {
	fileSize: 5 * 1024 * 1024, // 5MB
	files: 20, // Max 20 files at once
};

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits,
});

// Single image upload
export const uploadSingle = uploadMiddleware.single('image');

// Multiple images upload for property galleries
export const uploadMultiple = uploadMiddleware.array('images', 20);

// Mixed upload for property (main + gallery)
export const uploadProperty = uploadMiddleware.fields([
	{ name: 'mainImage', maxCount: 1 },
	{ name: 'galleryImages', maxCount: 20 },
]);
