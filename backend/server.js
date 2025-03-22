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
  app.use('/_next', express.static(path.join(nextJsBuildDir, 'static')));
  
  // List directories to debug
  if (fs.existsSync(path.join(nextJsBuildDir, 'server'))) {
    console.log('Server directory contents:', fs.readdirSync(path.join(nextJsBuildDir, 'server')));
    
    if (fs.existsSync(path.join(nextJsBuildDir, 'server', 'app'))) {
      console.log('App directory contents:', fs.readdirSync(path.join(nextJsBuildDir, 'server', 'app')));
    }
    
    if (fs.existsSync(path.join(nextJsBuildDir, 'server', 'pages'))) {
      console.log('Pages directory contents:', fs.readdirSync(path.join(nextJsBuildDir, 'server', 'pages')));
    }
  }
  
  // Handle all other routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Next.js 14 App Router puts HTML files directly in the app directory
    // Remove leading slash and handle root path special case
    const pathWithoutLeadingSlash = req.path === '/' ? 'index' : req.path.substring(1);
    
    // Try paths based on the actual structure from the logs
    const possiblePaths = [
      // App Router paths - direct HTML files
      path.join(nextJsBuildDir, 'server/app', `${pathWithoutLeadingSlash}.html`),
      // For nested routes like /samples/123
      path.join(nextJsBuildDir, 'server/app', pathWithoutLeadingSlash, 'index.html'),
      // Legacy patterns
      path.join(nextJsBuildDir, 'server/pages', `${pathWithoutLeadingSlash}.html`),
      path.join(nextJsBuildDir, 'server/pages', '404.html') // Fallback to 404
    ];
    
    console.log('Request path:', req.path);
    console.log('Checking possible HTML paths:', possiblePaths);
    
    // Try each path in order
    for (const htmlPath of possiblePaths) {
      if (fs.existsSync(htmlPath)) {
        console.log('Found HTML at:', htmlPath);
        return res.sendFile(htmlPath);
      }
    }
    
    // If no specific HTML file was found, try to serve the index.html
    // This supports client-side routing
    const indexHtmlPath = path.join(nextJsBuildDir, 'server/app/index.html');
    if (fs.existsSync(indexHtmlPath)) {
      console.log('Falling back to index.html for client-side routing');
      return res.sendFile(indexHtmlPath);
    }
    
    // If still no file was found, use the fallback HTML
    console.log('Could not find any HTML files, using fallback HTML');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sample Exchange</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; padding: 2rem; background: white; margin-top: 2rem; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            p { color: #666; line-height: 1.6; }
            .btn { display: inline-block; background: #0070f3; color: white; padding: 0.5rem 1rem; text-decoration: none; border-radius: 5px; font-weight: 500; margin-top: 1rem; }
            .api-list { background: #f9f9f9; padding: 1rem; border-radius: 5px; margin-top: 1rem; }
            .api-item { margin: 0.5rem 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sample Exchange</h1>
            <p>The server is running successfully, but there was an issue serving the Next.js frontend.</p>
            <p>The API endpoints are available and functional.</p>
            
            <div class="api-list">
              <h2>Available API Endpoints:</h2>
              <div class="api-item">/api/auth - Authentication endpoints</div>
              <div class="api-item">/api/users - User management</div>
              <div class="api-item">/api/samples - Sample data and search</div>
              <div class="api-item">/api/transactions - Transaction processing</div>
              <div class="api-item">/api/contact - Contact form submission</div>
            </div>
            
            <p>For more information, please check the server logs or contact the administrator.</p>
            <a href="/api/samples" class="btn">View Sample API Data</a>
          </div>
        </body>
      </html>
    `);
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
