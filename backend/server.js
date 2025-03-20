const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

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

// Serve static files from the Next.js app in production
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('Setting up Next.js frontend serving');
    
    // Check if Next.js build exists (look for 'out' directory since we're using export)
    const nextBuildPath = path.join(__dirname, '../frontend-next/out');
    const hasNextBuild = fs.existsSync(nextBuildPath);
    
    if (hasNextBuild) {
      console.log('Found Next.js build in:', nextBuildPath);
      
      // Serve static files from the out directory
      app.use(express.static(nextBuildPath));
      
      // For all other routes, try to serve the Next.js build
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path === '/health') {
          return next();
        }
        
        // Try to serve the index.html file (for client-side routing)
        const indexPath = path.join(nextBuildPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
        
        // Fallback if index.html is not found
        next();
      });
      
      console.log('Next.js frontend serving enabled');
    } else {
      console.log('Next.js build not found in:', nextBuildPath);
      console.log('Directory contents of parent:', fs.readdirSync(path.join(__dirname, '..')));
      if (fs.existsSync(path.join(__dirname, '../frontend-next'))) {
        console.log('frontend-next directory contents:', fs.readdirSync(path.join(__dirname, '../frontend-next')));
      }
      throw new Error('Next.js build directory not found');
    }
  } catch (error) {
    console.error('Error setting up Next.js frontend:', error.message);
    
    // Fallback if frontend setup fails
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      
      res.send(`
        <html>
          <head>
            <title>Sample Exchange</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              .api-list { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Sample Exchange API Server</h1>
            <p>The API server is running successfully.</p>
            <p>Frontend not available: ${error.message}</p>
            <div class="api-list">
              <h3>Available API Endpoints:</h3>
              <ul>
                <li>/api/auth</li>
                <li>/api/users</li>
                <li>/api/samples</li>
                <li>/api/transactions</li>
                <li>/api/contact</li>
              </ul>
            </div>
          </body>
        </html>
      `);
    });
  }
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
