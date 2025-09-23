import { Router, Response } from 'express';
import { uploadSingle } from '../middleware/uploadMiddleware';
import { s3Service } from '../services/s3Service';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';

interface UploadedImageData {
	url: string;
	key: string;
}

const router = Router();

// Upload single image (profile, etc.)
router.post('/single', authenticateToken, (req: AuthRequest, res: Response) => {
	uploadSingle(req, res, async (err: unknown) => {
		if (err) {
			return res.status(400).json({
				success: false,
				message: (err as Error).message,
			});
		}

		try {
			if (!req.user || !req.file) {
				return res.status(400).json({
					success: false,
					message: 'Aucune image fournie',
				});
			}

			const imageVariants = await s3Service.uploadImage({
				buffer: req.file.buffer,
				originalName: req.file.originalname,
				userId: req.user.id,
				folder: 'users',
			});

			const uploadedImage: UploadedImageData = {
				url: imageVariants[0]?.url,
				key: imageVariants[0]?.key,
			};

			res.status(200).json({
				success: true,
				message: 'Image uploadée avec succès',
				data: uploadedImage,
			});
		} catch (error) {
			console.error('Upload error:', error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de l'upload de l'image",
			});
		}
	});
});

// Delete images
router.delete(
	'/delete',
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			if (!req.user) {
				res.status(401).json({
					success: false,
					message: 'Authentification requise',
				});
				return;
			}

			const { keys } = req.body as { keys: string[] };

			if (!keys || !Array.isArray(keys)) {
				res.status(400).json({
					success: false,
					message: "Clés d'images requises",
				});
				return;
			}

			await s3Service.deleteMultipleImages(keys);

			res.status(200).json({
				success: true,
				message: 'Images supprimées avec succès',
			});
		} catch (error) {
			console.error('Delete error:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur lors de la suppression des images',
			});
		}
	},
);

export default router;
