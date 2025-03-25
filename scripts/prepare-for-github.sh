#!/bin/bash
# Script to prepare files for GitHub push

# Ensure directories exist
mkdir -p public/data
mkdir -p app/components

# Copy static files to source directories
cp out/index.html app/page.html
cp public/styles.css app/globals.css
cp public/data/samples.json public/data/samples.json

# Create a simple README.md
cat > README.md << 'EOL'
# Sample Exchange

The world's first marketplace for science. This platform allows researchers to share, monetize, and out-license research assets.

## Features

- Decentralized sample repositories
- Digital scientific assets
- Focus on small labs
- Inventory management

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The site is deployed on Cloudflare Pages.

EOL

echo "Files prepared for GitHub push!" 