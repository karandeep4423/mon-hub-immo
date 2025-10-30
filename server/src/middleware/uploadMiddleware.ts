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

// ========================
// Chat files (images + docs)
// ========================

const chatFileFilter = (
	req: MulterRequest,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedMimes = new Set([
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/webp',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		// Excel
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'text/csv',
		// PowerPoint
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		// Google Docs/Sheets exports often come as above; accept native Sheets mime just in case
		'application/vnd.google-apps.spreadsheet',
	]);

	if (allowedMimes.has(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Type de fichier non supporté.')); // Keep concise message
	}
};

const chatUpload = multer({ storage, fileFilter: chatFileFilter, limits });

// Single file for chat attachments (field name: 'file')
export const uploadChatSingle = chatUpload.single('file');

// ========================
// Identity documents (images + PDF)
// ========================

const identityDocFilter = (
	req: MulterRequest,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedMimes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/webp',
		'application/pdf',
	];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou PDF.',
			),
		);
	}
};

const identityDocUpload = multer({
	storage,
	fileFilter: identityDocFilter,
	limits,
});

export const uploadIdentityDoc = identityDocUpload.single('identityCard');
