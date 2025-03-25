#!/bin/bash

# Update the fix-nextjs-build.sh script
cat > fix-nextjs-build.sh << 'SH_EOL'
#!/bin/bash

# Make all scripts executable
chmod +x fix-document-issue.sh
chmod +x fix-webpack-config.sh
chmod +x fix-package-json.sh
chmod +x fix-layout-tsx.sh
chmod +x fix-page-tsx.sh
chmod +x fix-fallback-page.sh
chmod +x update-build-static.sh
chmod +x fix-wrangler-toml.sh
chmod +x fix-package-lock.sh

# Run all fix scripts
./fix-document-issue.sh
./fix-webpack-config.sh
./fix-package-json.sh
./fix-layout-tsx.sh
./fix-page-tsx.sh
./fix-fallback-page.sh
./update-build-static.sh
./fix-wrangler-toml.sh
./fix-package-lock.sh

echo "All Next.js build issues fixed! Ready to deploy."
SH_EOL

chmod +x fix-nextjs-build.sh
echo "Updated fix-nextjs-build.sh to include package-lock fix" 