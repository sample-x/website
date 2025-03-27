'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck, faTimes, faTable, faEye, faBan, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './upload.css';
import { isStaticExport } from '@/app/lib/staticData';

interface SampleData {
  name: string;
  type: string;
  location: string;
  collection_date: string;
  storage_condition: string;
  quantity: number;
  price: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  hash?: string;
  [key: string]: string | number | undefined;
}

interface ValidationError {
  row: string;
  field: string;
  message: string;
}

interface UploadState {
  status: 'idle' | 'validating' | 'uploading' | 'success' | 'error';
  message: string;
  data: SampleData[] | null;
  errors: ValidationError[];
  showPreview: boolean;
}

// Simple hash function for generating a unique identifier
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Function to generate a hash for a sample
function generateSampleHash(sample: Partial<SampleData>): string {
  // Create a string of all relevant fields that define uniqueness
  const uniqueFields = [
    sample.name,
    sample.type,
    sample.location,
    sample.collection_date,
    sample.storage_condition
  ].filter(Boolean).join(':');

  // Generate hash
  return simpleHash(uniqueFields);
}

export default function UploadPage() {
  const { supabase } = useSupabase();
  const [isStatic, setIsStatic] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    message: '',
    data: null,
    errors: [],
    showPreview: false
  });

  useEffect(() => {
    // Check if we're in static mode
    setIsStatic(isStaticExport());
  }, []);

  const validateField = (value: any, field: string, rowNumber: string): ValidationError | null => {
    const strValue = String(value);
    
    switch (field) {
      case 'price':
        const price = parseFloat(strValue);
        if (isNaN(price) || price < 0) {
          return {
            row: rowNumber,
            field,
            message: 'Price must be a positive number'
          };
        }
        break;

      case 'quantity':
        const quantity = parseInt(strValue);
        if (isNaN(quantity) || quantity < 1) {
          return {
            row: rowNumber,
            field,
            message: 'Quantity must be a positive integer'
          };
        }
        break;

      case 'collection_date':
        const date = new Date(strValue);
        if (isNaN(date.getTime())) {
          return {
            row: rowNumber,
            field,
            message: 'Invalid date format (use YYYY-MM-DD)'
          };
        }
        if (date > new Date()) {
          return {
            row: rowNumber,
            field,
            message: 'Collection date cannot be in the future'
          };
        }
        break;

      case 'latitude':
        if (strValue) {
          const lat = parseFloat(strValue);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return {
              row: rowNumber,
              field,
              message: 'Latitude must be between -90 and 90'
            };
          }
        }
        break;

      case 'longitude':
        if (strValue) {
          const lng = parseFloat(strValue);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return {
              row: rowNumber,
              field,
              message: 'Longitude must be between -180 and 180'
            };
          }
        }
        break;

      case 'type':
        const validTypes = ['bacterial', 'viral', 'fungal', 'tissue', 'environmental', 'cell line', 'soil', 'botanical', 'dna', 'water', 'industrial'];
        if (!validTypes.includes(strValue.toLowerCase())) {
          return {
            row: rowNumber,
            field,
            message: `Type must be one of: ${validTypes.join(', ')}`
          };
        }
        break;
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateCSV(file);
    }
  };

  const validateCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        console.log('Starting CSV validation...');
        const text = event.target?.result as string;
        console.log('CSV content:', text.substring(0, 100) + '...'); // Log first 100 chars
        
        // Split lines and clean them
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        console.log(`Found ${lines.length} non-empty lines`);
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header row and one data row');
        }
        
        console.log('Headers:', lines[0]);
        const headers = lines[0].split(',').map(header => header.trim());
        
        const requiredFields = [
          'name',
          'type',
          'location',
          'collection_date',
          'storage_condition',
          'quantity',
          'price'
        ];

        // Validate headers
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields);
          setUploadState({
            status: 'error',
            message: `Missing required fields: ${missingFields.join(', ')}`,
            data: null,
            errors: [],
            showPreview: false
          });
          return;
        }

        // Parse and validate data
        const data: SampleData[] = [];
        const errors: ValidationError[] = [];
        
        // Process each row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(',').map(value => value.trim());
          
          console.log(`Processing row ${i}:`, values);
          
          // Check if we have the correct number of values
          if (values.length !== headers.length) {
            console.log(`Row ${i} has incorrect number of values. Expected ${headers.length}, got ${values.length}`);
            errors.push({
              row: String(i),
              field: 'format',
              message: `Row has ${values.length} values but should have ${headers.length}`
            });
            continue;
          }

          // Create row object with default values
          const row: SampleData = {
            name: '',
            type: '',
            location: '',
            collection_date: '',
            storage_condition: '',
            quantity: 0,
            price: 0
          };

          // Process each field
          headers.forEach((header, j) => {
            const value = values[j];
            
            if (header === 'quantity') {
              const parsedQuantity = parseInt(value);
              if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                console.log(`Invalid quantity in row ${i}:`, value);
                errors.push({
                  row: String(i),
                  field: header,
                  message: 'Quantity must be a positive integer'
                });
                row[header] = 0;
              } else {
                row[header] = parsedQuantity;
              }
            } else if (header === 'price') {
              const parsedPrice = parseFloat(value);
              if (isNaN(parsedPrice) || parsedPrice < 0) {
                console.log(`Invalid price in row ${i}:`, value);
                errors.push({
                  row: String(i),
                  field: header,
                  message: 'Price must be a positive number'
                });
                row[header] = 0;
              } else {
                row[header] = parsedPrice;
              }
            } else {
              row[header as keyof SampleData] = value;
            }

            // Validate required fields
            if (requiredFields.includes(header) && !value) {
              errors.push({
                row: String(i),
                field: header,
                message: 'Required field cannot be empty'
              });
            }

            // Validate field format
            const fieldError = validateField(value, header, String(i));
            if (fieldError) {
              errors.push(fieldError);
            }
          });

          // Generate hash for duplicate detection
          try {
            const hashInput = [
              row.name,
              row.type,
              row.location,
              row.collection_date,
              row.storage_condition
            ].filter(Boolean).join(':');
            
            row.hash = simpleHash(hashInput);
            data.push(row);
          } catch (hashError) {
            console.error('Error generating hash for row:', hashError);
            errors.push({
              row: String(i),
              field: 'hash',
              message: 'Error generating sample hash'
            });
          }
        }

        console.log('Processed data:', data);
        console.log('Validation errors:', errors);

        if (errors.length > 0) {
          setUploadState({
            status: 'error',
            message: 'Validation errors found. Please check the error list below.',
            data,
            errors,
            showPreview: true
          });
          return;
        }

        setUploadState({
          status: 'validating',
          message: 'Data validated successfully. Ready to upload.',
          data,
          errors: [],
          showPreview: true
        });
      } catch (error) {
        console.error('Detailed CSV parsing error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setUploadState({
          status: 'error',
          message: `Error parsing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: null,
          errors: [],
          showPreview: false
        });
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      setUploadState({
        status: 'error',
        message: 'Error reading the file. Please try again.',
        data: null,
        errors: [],
        showPreview: false
      });
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    // In static mode, just show a simulated success message
    if (isStatic) {
      setUploadState(prevState => ({
        ...prevState,
        status: 'success',
        message: 'Simulated upload successful in demo mode. Note: In a real deployment, data would be saved to Supabase.'
      }));
      return;
    }

    if (!uploadState.data || uploadState.data.length === 0) {
      setUploadState(prevState => ({
        ...prevState,
        status: 'error',
        message: 'No valid data to upload'
      }));
      return;
    }

    try {
      setUploadState(prevState => ({
        ...prevState,
        status: 'uploading',
        message: 'Uploading samples to database...'
      }));

      // Process in batches to avoid timeout issues
      const batchSize = 50;
      const data = uploadState.data;
      
      console.log(`Starting upload of ${data.length} samples in batches of ${batchSize}`);
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, Math.min(i + batchSize, data.length));
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} samples`);
        
        const { error } = await supabase
          .from('samples')
          .insert(batch);
          
        if (error) {
          console.error(`Error uploading batch ${Math.floor(i/batchSize) + 1}:`, error);
          throw error;
        }
      }
      
      setUploadState(prevState => ({
        ...prevState,
        status: 'success',
        message: `Successfully uploaded ${data.length} samples`
      }));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prevState => ({
        ...prevState,
        status: 'error',
        message: error instanceof Error ? error.message : 'Error uploading samples'
      }));
    }
  };

  const handleCancel = () => {
    setUploadState({
      status: 'idle',
      message: '',
      data: null,
      errors: [],
      showPreview: false
    });
  };

  const renderPreviewTable = (data: SampleData[]) => {
    if (!data || data.length === 0) return null;
    
    const headers = Object.keys(data[0]).filter(key => key !== 'hash');
    
    return (
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index} 
              className={uploadState.errors.some(e => e.row === String(index + 1)) ? 'error-row' : ''}
            >
              {headers.map(key => (
                <td key={key}>{String(row[key] || '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Upload Samples</h1>
        
        {isStatic && (
          <div className="static-mode-notice">
            <FontAwesomeIcon icon={faInfoCircle} />
            <div>
              <h3>Demo Mode</h3>
              <p>
                You are viewing this page in demo mode. Sample uploads will be simulated but not actually stored in the database.
                In a production environment, uploaded samples would be saved to Supabase.
              </p>
            </div>
          </div>
        )}

        <div className="upload-instructions">
          <h2>How to Upload Samples</h2>
          <ol>
            <li>Prepare a CSV file with sample data, including required fields: name, type, location, collection_date, storage_condition, quantity, price.</li>
            <li>Optional fields: description, latitude, longitude, and any additional metadata.</li>
            <li>Click "Choose File" to select your CSV file.</li>
            <li>Review the data preview and validation results.</li>
            <li>Click "Upload" to save the samples to the database.</li>
          </ol>
        </div>

        {uploadState.status === 'idle' && (
          <div className="upload-dropzone">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />
            <label htmlFor="csv-upload" className="file-label">
              <FontAwesomeIcon icon={faUpload} className="upload-icon" />
              <span>Choose CSV File</span>
            </label>
          </div>
        )}

        {uploadState.status === 'validating' && (
          <div className="upload-status">
            <div className="loading-spinner"></div>
            <p>Validating CSV data...</p>
          </div>
        )}

        {uploadState.status === 'uploading' && (
          <div className="upload-status">
            <div className="loading-spinner"></div>
            <p>{uploadState.message}</p>
          </div>
        )}

        {uploadState.status === 'success' && (
          <div className="upload-result success">
            <FontAwesomeIcon icon={faCheck} className="result-icon success" />
            <p>{uploadState.message}</p>
            <button
              onClick={() => setUploadState({
                status: 'idle',
                message: '',
                data: null,
                errors: [],
                showPreview: false
              })}
              className="btn btn-primary"
            >
              Upload More Samples
            </button>
          </div>
        )}

        {uploadState.status === 'error' && (
          <div className="upload-result error">
            <FontAwesomeIcon icon={faTimes} className="result-icon error" />
            <p>{uploadState.message}</p>
            <button
              onClick={() => setUploadState({
                status: 'idle',
                message: '',
                data: null,
                errors: [],
                showPreview: false
              })}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {uploadState.data && uploadState.data.length > 0 && (
          <div className="upload-actions">
            <button
              onClick={() => setUploadState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
              className="btn btn-secondary"
            >
              <FontAwesomeIcon icon={uploadState.showPreview ? faEye : faTable} />
              {uploadState.showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <div className="primary-actions">
              <button
                onClick={handleCancel}
                className="btn btn-danger"
              >
                <FontAwesomeIcon icon={faBan} />
                Cancel
              </button>
              
              <button
                onClick={handleUpload}
                className="btn btn-success"
                disabled={uploadState.status === 'uploading'}
              >
                <FontAwesomeIcon icon={faUpload} />
                {isStatic ? 'Simulate Upload' : 'Upload Samples'}
              </button>
            </div>
          </div>
        )}

        {uploadState.errors.length > 0 && (
          <div className="validation-errors">
            <h3>Validation Errors</h3>
            <ul>
              {uploadState.errors.map((error, index) => (
                <li key={index} className="error-item">
                  <span className="error-row">Row {error.row}:</span>
                  <span className="error-field">{error.field}</span>
                  <span className="error-message">{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploadState.showPreview && uploadState.data && (
          <div className="data-preview">
            <h3>Data Preview</h3>
            {renderPreviewTable(uploadState.data)}
          </div>
        )}
      </div>
    </div>
  );
} 