#!/bin/bash

# Create the fallback page
./fix-fallback-page.sh

# Update the build script
./update-build-static.sh

# Fix the Next.js config
./fix-next-config.sh

# Fix the wrangler.toml file
./fix-wrangler-toml.sh

echo "All fixes applied! Ready to deploy with improved fallback content." 