const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected:', mongoose.connection.host))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Passport after loading environment variables
require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Next.js default ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to read and parse CSV
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Normalize sample data
const normalizeSampleData = (data) => {
  return data.map(item => {
    // Create coordinates from latitude/longitude if available
    const coordinates = item.coordinates || 
      (item.latitude && item.longitude ? [parseFloat(item.latitude), parseFloat(item.longitude)] : undefined);
    
    // Create a description if not available
    const description = item.description || 
      `${item.name} collected from ${item.host} in ${item.location}. This sample is currently ${item.availability.toLowerCase()}.`;
    
    return {
      id: item.id,
      name: item.name,
      type: item.type || item.category || 'unknown',
      host: item.host || 'Unknown',
      location: item.location || 'Unknown',
      coordinates,
      latitude: item.latitude,
      longitude: item.longitude,
      collectionDate: item.collectionDate || item.date,
      storageCondition: item.storageCondition,
      availability: item.availability,
      contact: item.contact,
      description
    };
  });
};

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact', contactRoutes);

// Add this with your other API endpoints
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Serve Next.js frontend
console.log('Setting up Next.js frontend serving');

// Updated paths to correctly locate the Next.js build
const nextJsBuildDir = path.join(__dirname, '../frontend/.next');
const nextPublicDir = path.join(__dirname, '../frontend/public');

// Check if the Next.js build directory exists
if (fs.existsSync(nextJsBuildDir)) {
  console.log('Next.js build found at:', nextJsBuildDir);
  
  // Serve static files from the public directory
  app.use(express.static(nextPublicDir));
  
  // Serve the Next.js build static files
  app.use('/_next', express.static(path.join(nextJsBuildDir, '_next')));
  
  // List the contents of the .next directory to better understand its structure
  console.log('Contents of Next.js build directory:', fs.readdirSync(nextJsBuildDir));
  
  // Handle all other routes with Next.js - modified for App Router
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // For App Router, we need to check a different structure
    // First try the app router HTML files
    const appHtmlPath = path.join(nextJsBuildDir, 'server/app', req.path === '/' ? 'index' : req.path.substring(1), 'page.html');
    const appIndexHtmlPath = path.join(nextJsBuildDir, 'server/pages/index.html');
    
    console.log('Trying to serve:', appHtmlPath);
    
    if (fs.existsSync(appHtmlPath)) {
      return res.sendFile(appHtmlPath);
    }
    
    // Try legacy pages structure as fallback
    if (fs.existsSync(appIndexHtmlPath)) {
      return res.sendFile(appIndexHtmlPath);
    }
    
    // If we can't find the HTML file, serve the root HTML and let client-side routing handle it
    const baseHtmlPath = path.join(nextJsBuildDir, 'server/pages/index.html');
    const appBaseHtmlPath = path.join(nextJsBuildDir, 'server/app/index/page.html');
    
    // Try both possible locations for the index HTML
    if (fs.existsSync(baseHtmlPath)) {
      return res.sendFile(baseHtmlPath);
    } else if (fs.existsSync(appBaseHtmlPath)) {
      return res.sendFile(appBaseHtmlPath);
    } else {
      // If we can't find any HTML files, list the directory contents to help debug
      console.log('Next.js build directory contents:', fs.readdirSync(nextJsBuildDir));
      if (fs.existsSync(path.join(nextJsBuildDir, 'server'))) {
        console.log('Server directory contents:', fs.readdirSync(path.join(nextJsBuildDir, 'server')));
      }
      
      // Return a fallback HTML page
      res.send(`
        <h1>Sample Exchange</h1>
        <p>The server is running, but the Next.js build files could not be found.</p>
        <p>Please check the server logs for more information.</p>
      `);
    }
  });
} else {
  console.log('Directory contents of frontend:', fs.readdirSync(path.join(__dirname, '../frontend')));
  console.error('Error setting up Next.js frontend: Next.js build directory not found');
  
  // API endpoint info for when frontend is not available
  app.get('/', (req, res) => {
    res.send(`
      <h1>Sample Exchange API Server</h1>
      <p>The API server is running successfully.</p>
      <p><strong>Frontend not available:</strong> Next.js build not found in: ${nextJsBuildDir}</p>
      <h2>Available API Endpoints:</h2>
      <ul>
        <li>/api/auth</li>
        <li>/api/users</li>
        <li>/api/samples</li>
        <li>/api/transactions</li>
        <li>/api/contact</li>
      </ul>
    `);
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.get('/api/samples', async (req, res) => {
  try {
    // Try to read JSON data first
    const jsonPath = path.join(__dirname, 'data', 'samples.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json(normalizeSampleData(jsonData));
    }
    
    // Fall back to CSV if JSON doesn't exist
    const csvPath = path.join(__dirname, 'data', 'samples.csv');
    if (fs.existsSync(csvPath)) {
      const csvData = await readCSV(csvPath);
      return res.json(normalizeSampleData(csvData));
    }
    
    // No data found
    return res.status(404).json({ error: 'No sample data found' });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

// Get a single sample by ID
app.get('/api/samples/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to read JSON data first
    const jsonPath = path.join(__dirname, 'data', 'samples.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const sample = jsonData.find(s => s.id.toString() === id);
      if (sample) {
        return res.json(normalizeSampleData([sample])[0]);
      }
    }
    
    // Fall back to CSV if JSON doesn't exist or sample not found
    const csvPath = path.join(__dirname, 'data', 'samples.csv');
    if (fs.existsSync(csvPath)) {
      const csvData = await readCSV(csvPath);
      const sample = csvData.find(s => s.id.toString() === id);
      if (sample) {
        return res.json(normalizeSampleData([sample])[0]);
      }
    }
    
    // Sample not found
    return res.status(404).json({ error: 'Sample not found' });
  } catch (error) {
    console.error('Error fetching sample:', error);
    res.status(500).json({ error: 'Failed to fetch sample' });
  }
});

// Mock checkout endpoint
app.post('/api/checkout', (req, res) => {
  const { sampleId } = req.body;
  
  if (!sampleId) {
    return res.status(400).json({ error: 'Sample ID is required' });
  }
  
  // In a real implementation, this would process the payment and update inventory
  // For now, just return a success response
  res.json({
    success: true,
    message: 'Checkout successful',
    orderId: `ORDER-${Date.now()}`,
    sampleId
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
