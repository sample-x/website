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

// Diagnostic logging for sample data files
const jsonSamplesPath = path.join(__dirname, 'data', 'samples.json');
const csvSamplesPath = path.join(__dirname, 'data', 'samples.csv');

console.log('Checking for samples data files:');
console.log('JSON samples path:', jsonSamplesPath, 'exists:', fs.existsSync(jsonSamplesPath));
console.log('CSV samples path:', csvSamplesPath, 'exists:', fs.existsSync(csvSamplesPath));

// If neither file exists, list the contents of the backend directory
if (!fs.existsSync(jsonSamplesPath) && !fs.existsSync(csvSamplesPath)) {
  console.log('No samples data files found. Directory structure:');
  console.log('Backend directory:', fs.readdirSync(__dirname));
  
  const dataDir = path.join(__dirname, 'data');
  if (fs.existsSync(dataDir)) {
    console.log('Data directory contents:', fs.readdirSync(dataDir));
  } else {
    console.log('Data directory does not exist. Creating it...');
    fs.mkdirSync(dataDir, { recursive: true });
    
    // Create a basic samples.json file with sample data if none exists
    const sampleData = [
      {
        id: 1,
        name: "Marine Bacterial Culture",
        type: "Bacterial",
        host: "Seawater",
        location: "Pacific Ocean",
        latitude: "34.0522",
        longitude: "-118.2437",
        collectionDate: "2023-06-15",
        storageCondition: "Refrigerated",
        availability: "Available",
        contact: "researcher@example.com",
        description: "Marine bacterial culture collected from Pacific Ocean samples."
      },
      {
        id: 2,
        name: "Human Tissue Sample",
        type: "Tissue",
        host: "Human",
        location: "San Francisco",
        latitude: "37.7749",
        longitude: "-122.4194",
        collectionDate: "2023-07-20",
        storageCondition: "Frozen",
        availability: "Limited",
        contact: "hospital@example.com",
        description: "Human tissue sample for research purposes."
      },
      {
        id: 3,
        name: "Plant Extract",
        type: "Botanical",
        host: "Medicinal Plant",
        location: "Amazon Rainforest",
        latitude: "-3.4653",
        longitude: "-62.2159",
        collectionDate: "2023-05-10",
        storageCondition: "Room Temperature",
        availability: "Available",
        contact: "botanist@example.com",
        description: "Extracted compounds from rare medicinal plants."
      }
    ];
    
    fs.writeFileSync(path.join(dataDir, 'samples.json'), JSON.stringify(sampleData, null, 2));
    console.log('Created default samples.json file with sample data');
  }
}

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
  
  // Serve public files first
  app.use(express.static(nextPublicDir));
  
  // Directly serve static assets from .next/static
  app.use('/_next/static', express.static(path.join(nextJsBuildDir, 'static')));
  
  // Route for static chunks specifically
  app.get('/_next/static/chunks/:filename', (req, res) => {
    const filePath = path.join(nextJsBuildDir, 'static/chunks', req.params.filename);
    console.log('Serving static chunk:', filePath);
    
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('Static chunk not found');
  });
  
  // Route for static CSS
  app.get('/_next/static/css/:filename', (req, res) => {
    const filePath = path.join(nextJsBuildDir, 'static/css', req.params.filename);
    console.log('Serving static CSS:', filePath);
    
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('Static CSS not found');
  });
  
  // Route for static media
  app.get('/_next/static/media/:filename', (req, res) => {
    const filePath = path.join(nextJsBuildDir, 'static/media', req.params.filename);
    console.log('Serving static media:', filePath);
    
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('Static media not found');
  });
  
  // Route for image optimization
  app.get('/_next/image', (req, res) => {
    // Extract the url parameter from the query
    const imageUrl = req.query.url;
    if (imageUrl) {
      // If it's an absolute URL, we can't handle it
      if (imageUrl.startsWith('http')) {
        return res.redirect(imageUrl);
      }
      
      // Try to find the image in the public directory
      const imagePath = path.join(nextPublicDir, imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl);
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
    }
    
    res.status(404).send('Image not found');
  });
  
  // Handle API routes
  app.use('/api', (req, res, next) => {
    next(); // This allows the API routes to be handled by your API handlers
  });
  
  // Handle HTML/page routes
  app.get('*', (req, res) => {
    // Skip asset paths entirely - they should have been handled by the static middleware
    if (req.path.includes('/_next/') || req.path.includes('/static/')) {
      return res.status(404).send('Asset not found');
    }
    
    // First try to serve the specific HTML file
    const pathWithoutLeadingSlash = req.path === '/' ? 'index' : req.path.substring(1);
    const directHtmlPath = path.join(nextJsBuildDir, 'server/app', `${pathWithoutLeadingSlash}.html`);
    
    console.log('Request path (HTML):', req.path);
    
    if (fs.existsSync(directHtmlPath)) {
      console.log('Found HTML at:', directHtmlPath);
      return res.sendFile(directHtmlPath);
    }
    
    // For nested routes, try finding the HTML in a subdirectory
    const nestedPath = path.join(nextJsBuildDir, 'server/app', pathWithoutLeadingSlash, 'index.html');
    if (fs.existsSync(nestedPath)) {
      console.log('Found nested HTML at:', nestedPath);
      return res.sendFile(nestedPath);
    }
    
    // If no specific HTML file was found, serve the index.html
    // This supports client-side routing
    const indexHtmlPath = path.join(nextJsBuildDir, 'server/app/index.html');
    if (fs.existsSync(indexHtmlPath)) {
      console.log('Falling back to index.html for client-side routing');
      return res.sendFile(indexHtmlPath);
    }
    
    // If all else fails, try serving the 404 page
    const notFoundPath = path.join(nextJsBuildDir, 'server/app/_not-found.html');
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
    
    // Ultimate fallback
    res.status(404).send('Page not found');
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

// API Routes for samples data
app.get('/api/samples', (req, res) => {
  try {
    // Try to read from samples.json first
    const jsonPath = path.join(__dirname, 'data', 'samples.json');
    
    console.log('Looking for samples.json at:', jsonPath);
    console.log('This file exists:', fs.existsSync(jsonPath));
    
    if (fs.existsSync(jsonPath)) {
      console.log('Reading samples from JSON file');
      const samplesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.json(samplesData);
    }
    
    // Fall back to creating demo data if file doesn't exist
    console.log('No samples.json found, creating sample data');
    
    // Create directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create sample data
    const sampleData = [
      {
        id: 1,
        name: "Marine Bacterial Culture",
        type: "Bacterial",
        host: "Seawater",
        location: "Pacific Ocean",
        latitude: "34.0522",
        longitude: "-118.2437",
        collectionDate: "2023-06-15",
        storageCondition: "Refrigerated",
        availability: "Available",
        contact: "researcher@example.com",
        description: "Marine bacterial culture collected from Pacific Ocean samples.",
        price: 299,
        quantity: 1,
        unit: "sample"
      },
      {
        id: 2,
        name: "Human Tissue Sample",
        type: "Tissue",
        host: "Human",
        location: "San Francisco",
        latitude: "37.7749",
        longitude: "-122.4194",
        collectionDate: "2023-07-20",
        storageCondition: "Frozen",
        availability: "Limited",
        contact: "hospital@example.com",
        description: "Human tissue sample for research purposes.",
        price: 499,
        quantity: 1,
        unit: "sample"
      },
      {
        id: 3,
        name: "Plant Extract",
        type: "Botanical",
        host: "Medicinal Plant",
        location: "Amazon Rainforest",
        latitude: "-3.4653",
        longitude: "-62.2159",
        collectionDate: "2023-05-10",
        storageCondition: "Room Temperature",
        availability: "Available",
        contact: "botanist@example.com",
        description: "Extracted compounds from rare medicinal plants.",
        price: 199,
        quantity: 5,
        unit: "ml"
      },
      {
        id: 4,
        name: "Soil Microbiome",
        type: "Environmental",
        host: "Soil",
        location: "Rocky Mountains",
        latitude: "39.1911",
        longitude: "-106.8175",
        collectionDate: "2023-08-05",
        storageCondition: "Frozen",
        availability: "Available",
        contact: "ecology@example.com",
        description: "Diverse soil microbiome sample from alpine environment.",
        price: 249,
        quantity: 10,
        unit: "gram"
      },
      {
        id: 5,
        name: "Viral Vector",
        type: "Viral",
        host: "Laboratory",
        location: "Boston",
        latitude: "42.3601",
        longitude: "-71.0589",
        collectionDate: "2023-09-01",
        storageCondition: "Ultra-Low Temperature",
        availability: "Limited",
        contact: "virology@example.com",
        description: "Engineered viral vectors for gene therapy research.",
        price: 599,
        quantity: 1,
        unit: "vial"
      }
    ];
    
    // Save the sample data to a file for future use
    fs.writeFileSync(jsonPath, JSON.stringify(sampleData, null, 2));
    
    // Return the sample data
    return res.json(sampleData);
    
  } catch (error) {
    console.error('Error serving samples data:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve samples',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
