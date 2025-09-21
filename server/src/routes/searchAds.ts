import express from 'express';
import { authenticateToken } from '../middleware/auth';
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

// @route   GET api/search-ads
// @desc    Get all active search ads
// @access  Public
router.get('/', getAllSearchAds);

// @route   POST api/search-ads
// @desc    Create a search ad
// @access  Private
router.post('/', authenticateToken, createSearchAd);

// @route   GET api/search-ads/my-ads
// @desc    Get current user's search ads
// @access  Private
router.get('/my-ads', authenticateToken, getMySearchAds);

// @route   GET api/search-ads/:id
// @desc    Get a search ad by ID
// @access  Public
router.get('/:id', getSearchAdById);

// @route   PUT api/search-ads/:id
// @desc    Update a search ad
// @access  Private
router.put('/:id', authenticateToken, updateSearchAd);

// @route   DELETE api/search-ads/:id
// @desc    Delete a search ad
// @access  Private
router.delete('/:id', authenticateToken, deleteSearchAd);

// @route   PATCH api/search-ads/:id/status
// @desc    Update search ad status
// @access  Private
router.patch('/:id/status', authenticateToken, updateSearchAdStatus);

export default router;
