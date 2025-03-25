#!/bin/bash
# Unified build script for Sample Exchange

set -euo pipefail

# Build configuration
export NEXT_TELEMETRY_DISABLED=1

# Clean previous build
rm -rf .next out

# Build for production
echo "Building Next.js application..."
npm run build

# Output success message
echo "Build completed successfully!"
echo "Output files are in the 'out' directory"
