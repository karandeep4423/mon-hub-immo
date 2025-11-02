import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
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

// ============================================================================
// PUBLIC/HYBRID ROUTES
// ============================================================================

// @route   GET api/appointments/availability/:agentId
// @desc    Get agent availability
// @access  Public
router.get('/availability/:agentId', getAgentAvailability);

// @route   GET api/appointments/availability/:agentId/slots
// @desc    Get available time slots for agent
// @access  Public
router.get('/availability/:agentId/slots', getAvailableSlots);

// @route   POST api/appointments
// @desc    Create appointment (allows anonymous booking with optionalAuth)
// @access  Public (with optional authentication for better UX)
router.post('/', optionalAuth, createAppointment);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Apply authentication middleware to all routes below
router.use(authenticateToken);

// @route   GET api/appointments/my
// @desc    Get current user's appointments
// @access  Private (authenticated users)
router.get('/my', getMyAppointments);

// @route   GET api/appointments/my/stats
// @desc    Get appointment statistics
// @access  Private (authenticated users)
router.get('/my/stats', getAppointmentStats);

// @route   GET api/appointments/:id
// @desc    Get specific appointment details
// @access  Private (authenticated users)
router.get('/:id', getAppointment);

// @route   PATCH api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (authenticated users)
router.patch('/:id/status', updateAppointmentStatus);

// @route   PATCH api/appointments/:id/reschedule
// @desc    Reschedule an appointment
// @access  Private (authenticated users)
router.patch('/:id/reschedule', rescheduleAppointment);

// @route   PATCH api/appointments/availability
// @desc    Update agent availability
// @access  Private (authenticated users)
router.patch('/availability', updateAgentAvailability);

export default router;
