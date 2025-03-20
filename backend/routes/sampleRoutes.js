const express = require('express');
const router = express.Router();
const {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample
} = require('../controllers/sampleController');
const { protect } = require('../middleware/auth');

// @route   GET /api/samples
// @desc    Get all samples
// @access  Public
router.get('/', getSamples);

// @route   GET /api/samples/:id
// @desc    Get sample by ID
// @access  Public
router.get('/:id', getSampleById);

// @route   POST /api/samples
// @desc    Create a new sample
// @access  Private
router.post('/', protect, createSample);

// @route   PUT /api/samples/:id
// @desc    Update a sample
// @access  Private
router.put('/:id', protect, updateSample);

// @route   DELETE /api/samples/:id
// @desc    Delete a sample
// @access  Private
router.delete('/:id', protect, deleteSample);

module.exports = router;
