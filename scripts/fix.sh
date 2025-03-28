#!/bin/bash

# Create the samples.css file
mkdir -p app/samples
cat > app/samples/samples.css << 'CSS_EOL'
/* Samples page specific styles */
.samples-page {
  padding-top: 0;
}

.samples-hero {
  background-color: var(--color-dark);
  color: var(--color-light);
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
}

.samples-hero h1 {
  color: var(--color-light);
  margin-bottom: 1rem;
}

.samples-hero h1::after {
  background-color: var(--color-accent);
}

.samples-hero p {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  opacity: 0.9;
}

.samples-content {
  padding: 0 2rem 4rem;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box input,
.category-filter select {
  padding: 0.8rem 1.2rem;
  border: 2px solid var(--color-dark);
  border-radius: 4px;
  font-family: var(--font-primary);
  font-size: 1rem;
  background-color: var(--color-light);
  min-width: 250px;
}

.search-box input:focus,
.category-filter select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.samples-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
}

.map-container {
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.samples-list {
  background-color: var(--color-light);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.samples-list h2 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.table-container {
  overflow-x: auto;
}

.samples-table {
  width: 100%;
  border-collapse: collapse;
}

.samples-table th,
.samples-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.samples-table th {
  font-weight: 700;
  color: var(--color-dark);
  background-color: rgba(0,0,0,0.03);
}

.samples-table tr:hover {
  background-color: rgba(0,0,0,0.02);
}

.category-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.category-badge.water {
  background-color: #4a90e2;
}

.category-badge.soil {
  background-color: #8e6e53;
}

.category-badge.air {
  background-color: #7ed321;
}

.category-badge.ice {
  background-color: #50e3c2;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.sample-popup {
  padding: 0.8rem;
  max-width: 300px;
}

.sample-popup h3 {
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.sample-popup p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.sample-popup .metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0.8rem 0;
  font-size: 0.85rem;
}

.sample-popup .metadata-item {
  display: flex;
  flex-direction: column;
}

.sample-popup .metadata-label {
  font-weight: bold;
  color: var(--color-dark);
  font-size: 0.8rem;
}

.sample-popup .availability {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.sample-popup .availability.available {
  background-color: #2ecc71;
  color: white;
}

.sample-popup .availability.limited {
  background-color: #f39c12;
  color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0,0,0,0.1);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 4rem 0;
}

.error-container p {
  color: #e74c3c;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.no-results {
  text-align: center;
  padding: 2rem 0;
}

.no-results p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: #666;
}

.leaflet-marker-icon {
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.marker-bacterial {
  background-color: #e74c3c;
}

.marker-viral {
  background-color: #9b59b6;
}

.marker-fungal {
  background-color: #2ecc71;
}

.marker-tissue {
  background-color: #f39c12;
}

.marker-environmental {
  background-color: #3498db;
}

.category-badge.bacterial {
  background-color: #e74c3c;
}

.category-badge.viral {
  background-color: #9b59b6;
}

.category-badge.fungal {
  background-color: #2ecc71;
}

.category-badge.tissue {
  background-color: #f39c12;
}

.category-badge.environmental {
  background-color: #3498db;
}

@media (max-width: 992px) {
  .samples-grid {
    grid-template-columns: 1fr;
  }
  
  .map-container {
    height: 400px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box,
  .category-filter {
    width: 100%;
  }
  
  .search-box input,
  .category-filter select {
    width: 100%;
  }
}

/* Add styles for the purchase button */
.btn-purchase {
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-purchase:hover {
  background-color: #d97706; /* Darker shade of primary color */
}

/* Update the sample popup button */
.sample-popup .btn-purchase {
  margin-top: 1rem;
  display: inline-block;
  width: 100%;
  text-align: center;
}
CSS_EOL

chmod +x fix-samples-css.sh
echo "Created samples.css file with all necessary styles"