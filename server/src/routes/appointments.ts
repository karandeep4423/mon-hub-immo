import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
	createAppointment,
	getMyAppointments,
	getAppointment,
	updateAppointmentStatus,
	rescheduleAppointment,
	getAppointmentStats,
	getAgentAvailability,
	updateAgentAvailability,
	getAvailableSlots,
} from '../controllers/appointmentController';

const router = express.Router();

// Appointment routes
router.post('/', authenticateToken, createAppointment);
router.get('/my', authenticateToken, getMyAppointments);
router.get('/my/stats', authenticateToken, getAppointmentStats);
router.get('/:id', authenticateToken, getAppointment);
router.patch('/:id/status', authenticateToken, updateAppointmentStatus);
router.patch('/:id/reschedule', authenticateToken, rescheduleAppointment);

// Agent availability routes
router.get('/availability/:agentId', getAgentAvailability);
router.patch('/availability', authenticateToken, updateAgentAvailability);
router.get('/availability/:agentId/slots', getAvailableSlots);

export default router;
