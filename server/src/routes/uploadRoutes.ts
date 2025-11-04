import { Router, Response } from 'express';
import {
	uploadSingle,
	uploadChatSingle,
	uploadIdentityDoc,
} from '../middleware/uploadMiddleware';
import { s3Service } from '../services/s3Service';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger';

interface UploadedImageData {
	url: string;
	key: string;
}

const router = Router();

// ============================================================================
// PROTECTED ROUTES (All upload routes require authentication)
// ============================================================================

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST api/upload/single
// @desc    Upload single image (profile, etc.)
// @access  Private (authenticated users)
router.post('/single', (req: AuthRequest, res: Response) => {
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
			logger.error('[UploadRoutes] Upload error', error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de l'upload de l'image",
			});
		}
	});
});

// @route   POST api/upload/chat-file
// @desc    Upload chat file (images, pdf, docs)
// @access  Private (authenticated users)
router.post('/chat-file', (req: AuthRequest, res: Response) => {
	uploadChatSingle(req, res, async (err: unknown) => {
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
					message: 'Aucun fichier fourni',
				});
			}

			const uploaded = await s3Service.uploadObject({
				buffer: req.file.buffer,
				originalName: req.file.originalname,
				userId: req.user.id,
				folder: 'chat',
				contentType: req.file.mimetype,
			});

			return res.status(200).json({
				success: true,
				message: 'Fichier uploadé avec succès',
				data: {
					url: uploaded.url,
					key: uploaded.key,
					name: req.file.originalname,
					mime: req.file.mimetype,
					size: req.file.size,
				},
			});
		} catch (error) {
			logger.error('[UploadRoutes] Upload chat file error', error);
			return res.status(500).json({
				success: false,
				message: "Erreur lors de l'upload du fichier",
			});
		}
	});
});

// @route   DELETE api/upload/delete
// @desc    Delete images
// @access  Private (authenticated users)
router.delete('/delete', async (req: AuthRequest, res: Response) => {
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
		logger.error('[UploadRoutes] Delete error', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la suppression des images',
		});
	}
});

// @route   POST api/upload/identity-card
// @desc    Upload identity card document (image or PDF)
// @access  Private (authenticated users)
router.post('/identity-card', (req: AuthRequest, res: Response) => {
	uploadIdentityDoc(req, res, async (err: unknown) => {
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
					message: 'Aucun document fourni',
				});
			}

			const uploaded = await s3Service.uploadObject({
				buffer: req.file.buffer,
				originalName: req.file.originalname,
				userId: req.user.id,
				folder: 'users',
				contentType: req.file.mimetype,
			});

			return res.status(200).json({
				success: true,
				message: "Carte d'identité uploadée avec succès",
				data: {
					url: uploaded.url,
					key: uploaded.key,
				},
			});
		} catch (error) {
			logger.error('[UploadRoutes] Upload identity card error', error);
			return res.status(500).json({
				success: false,
				message: "Erreur lors de l'upload du document",
			});
		}
	});
});

export default router;
