const Sample = require('../models/Sample');

// @desc    Get all samples
// @route   GET /api/samples
// @access  Public
const getSamples = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search by title or description if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const samples = await Sample.find(query).populate('seller', 'name email avatar');
    res.json(samples);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get sample by ID
// @route   GET /api/samples/:id
// @access  Public
const getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id).populate('seller', 'name email avatar');

    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    res.json(sample);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Sample not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new sample
// @route   POST /api/samples
// @access  Private
const createSample = async (req, res) => {
  try {
    const { title, description, price, category, imageURL } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create new sample
    const sample = await Sample.create({
      title,
      description,
      price,
      category,
      imageURL,
      seller: req.user.id
    });

    res.status(201).json(sample);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a sample
// @route   PUT /api/samples/:id
// @access  Private
const updateSample = async (req, res) => {
  try {
    const { title, description, price, category, imageURL } = req.body;
    
    // Find sample
    let sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    // Check if user is the seller
    if (sample.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this sample' });
    }

    // Update fields if provided
    if (title) sample.title = title;
    if (description) sample.description = description;
    if (price) sample.price = price;
    if (category) sample.category = category;
    if (imageURL) sample.imageURL = imageURL;

    // Save updated sample
    const updatedSample = await sample.save();
    res.json(updatedSample);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Sample not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a sample
// @route   DELETE /api/samples/:id
// @access  Private
const deleteSample = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    // Check if user is the seller
    if (sample.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this sample' });
    }

    await sample.deleteOne();
    res.json({ message: 'Sample removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Sample not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample
};
