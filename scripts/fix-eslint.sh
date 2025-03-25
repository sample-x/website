#!/bin/bash

# Final cleanup script for Next.js codebase
set -euo pipefail

echo "Starting final cleanup..."

# Create backup of anything we're about to delete
mkdir -p .backup
echo "Creating backups in .backup/ directory..."

# Backup pages directory
if [ -d "pages" ]; then
  echo "Backing up pages/ directory..."
  cp -r pages .backup/pages
  echo "Removing pages/ directory (App Router is preferred)..."
  rm -rf pages
fi

# Move fix-eslint.sh to scripts directory
if [ -f "fix-eslint.sh" ]; then
  echo "Moving fix-eslint.sh to scripts directory..."
  mv fix-eslint.sh scripts/
fi

# Backup cleanup instruction files
for file in CLEANUP-INSTRUCTIONS.md MANUAL-CLEANUP.md; do
  if [ -f "$file" ]; then
    echo "Backing up $file..."
    cp "$file" ".backup/$file"
    echo "Removing $file..."
    rm "$file"
  fi
done

# Update .gitignore to exclude build artifacts
if [ -f ".gitignore" ]; then
  echo "Updating .gitignore to exclude build artifacts..."
  
  # Check if .next and out are already in .gitignore
  if ! grep -q "^\.next$" .gitignore; then
    echo ".next" >> .gitignore
  fi
  
  if ! grep -q "^out$" .gitignore; then
    echo "out" >> .gitignore
  fi

  echo ".backup" >> .gitignore
fi

# Check for _routes.json
if [ -f "_routes.json" ]; then
  echo "_routes.json may be redundant with Next.js routing."
  echo "Backing it up to .backup/_routes.json..."
  cp _routes.json .backup/_routes.json
  echo "Consider removing _routes.json if you're not using it explicitly."
fi

# Create a README note about server.js
if [ -f "server.js" ]; then
  echo "Note: server.js might be redundant with Next.js built-in server."
  echo "Review if it's still needed for your deployment process."
fi

# Suggest moving samples.json to a better location
if [ -f "samples.json" ]; then
  echo "Note: samples.json (24K) should ideally be moved to:"
  echo "  - A database"
  echo "  - An API endpoint"
  echo "  - The public/ directory if it must be static"
fi

# Clean up build artifacts if needed
echo "Would you like to remove build artifacts (.next and out directories)? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
  fi
  
  if [ -d "out" ]; then
    echo "Removing out directory..."
    rm -rf out
  fi
fi

echo "Final cleanup completed!"
echo "Backup of remove