import { Request } from 'express';

export interface AuthRequest extends Request {
	userId?: string;
	user?: {
		id: string;
		userType: 'agent' | 'apporteur';
	};
	clientIP?: string;
	file?: Express.Multer.File;
	files?:
		| { [fieldname: string]: Express.Multer.File[] }
		| Express.Multer.File[];
}
