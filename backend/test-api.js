// A simple script to test the API endpoints

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Samples endpoint
app.get('/api/samples', (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'data', 'samples.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json(jsonData);
    }
    
    res.status(404).json({ error: 'No sample data found' });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test API server running on port ${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/api/test`);
  console.log(`Try accessing: http://localhost:${PORT}/api/samples`);
}); 