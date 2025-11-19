import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireOwnership } from '../middleware/authorize';
import { SearchAd } from '../models/SearchAd';
import {
	createSearchAd,
	getAllSearchAds,
	getMySearchAds,
	getSearchAdById,
	updateSearchAd,
	deleteSearchAd,
	updateSearchAdStatus,
} from '../controllers/searchAdController';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// @route   GET api/search-ads
// @desc    Get all active search ads
// @access  Public
router.get('/', getAllSearchAds);

// @route   GET api/search-ads/:id (MongoDB ObjectId only - 24 hex characters)
// @desc    Get a search ad by ID
// @access  Public
router.get('/:id([0-9a-fA-F]{24})', getSearchAdById);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Apply authentication and subscription middleware to all routes below
import { requireActiveSubscription } from '../middleware/subscription';
router.use(authenticateToken, requireActiveSubscription);

// @route   POST api/search-ads
// @desc    Create a search ad
// @access  Private (authenticated users)
router.post('/', createSearchAd);

// @route   GET api/search-ads/my-ads
// @desc    Get current user's search ads
// @access  Private (authenticated users)
router.get('/my-ads', getMySearchAds);

// @route   PUT api/search-ads/:id
// @desc    Update a search ad (ownership verified by middleware)
// @access  Private (owner only)
router.put('/:id', requireOwnership(SearchAd), updateSearchAd);

// @route   DELETE api/search-ads/:id
// @desc    Delete a search ad (ownership verified by middleware)
// @access  Private (owner only)
router.delete('/:id', requireOwnership(SearchAd), deleteSearchAd);

// @route   PATCH api/search-ads/:id/status
// @desc    Update search ad status (ownership verified by middleware)
// @access  Private (owner only)
router.patch('/:id/status', requireOwnership(SearchAd), updateSearchAdStatus);

export default router;
