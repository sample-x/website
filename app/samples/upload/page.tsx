'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck, faTimes, faTable, faEye, faBan } from '@fortawesome/free-solid-svg-icons';
import './upload.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    message: '',
    data: null,
    errors: [],
    showPreview: false
  });

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
    if (!uploadState.data) return;

    try {
      // First, fetch existing samples to check for duplicates using composite key
      const { data: existingSamples, error: fetchError } = await supabase
        .from('samples')
        .select('id, name, type, location, collection_date, storage_condition, quantity');

      if (fetchError) {
        console.error('Error fetching samples:', fetchError);
        throw new Error(fetchError.message);
      }

      // Create a map of existing samples using composite key
      const existingSampleMap = new Map(
        existingSamples?.map(sample => [
          generateSampleHash({
            name: sample.name,
            type: sample.type,
            location: sample.location,
            collection_date: sample.collection_date,
            storage_condition: sample.storage_condition
          }),
          sample
        ]) || []
      );

      // Separate new samples and updates
      const newSamples = [];
      const updates = [];

      for (const sample of uploadState.data) {
        // Remove hash from sample data since it's not in the database
        const { hash, ...sampleWithoutHash } = sample;
        const sampleQuantity = Number(sample.quantity);
        
        // Check for duplicate using composite key
        const existingSample = existingSampleMap.get(hash || '');
        
        if (existingSample) {
          // Update existing sample quantity
          updates.push({
            id: existingSample.id,
            quantity: existingSample.quantity + sampleQuantity
          });
        } else {
          // Add new sample (without hash field)
          newSamples.push(sampleWithoutHash);
        }
      }

      // Perform updates first
      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('samples')
            .update({ quantity: update.quantity })
            .eq('id', update.id);

          if (updateError) {
            console.error('Error updating sample:', updateError);
            throw new Error(updateError.message);
          }
        }
      }

      // Insert new samples
      if (newSamples.length > 0) {
        const { error: insertError } = await supabase
          .from('samples')
          .insert(newSamples)
          .select();

        if (insertError) {
          console.error('Error inserting samples:', insertError);
          throw new Error(insertError.message);
        }
      }

      setUploadState({
        status: 'success',
        message: `Upload complete: ${newSamples.length} new samples added, ${updates.length} existing samples updated.`,
        data: null,
        errors: [],
        showPreview: false
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState({
        status: 'error',
        message: `Error uploading samples: ${error.message}`,
        data: uploadState.data,
        errors: uploadState.errors,
        showPreview: true
      });
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
    <main className="upload-page">
      <div className="upload-hero">
        <h1>Upload Samples</h1>
        <p>Upload your sample dataset in CSV format.</p>
      </div>

      <div className="upload-content">
        <div className="upload-container">
          <div className="upload-instructions">
            <h2>Instructions</h2>
            <p>Please ensure your CSV file includes the following required fields:</p>
            <ul>
              <li>name - Sample name</li>
              <li>type - Sample type (bacterial, viral, fungal, etc.)</li>
              <li>location - Collection location</li>
              <li>collection_date - Date of collection (YYYY-MM-DD)</li>
              <li>storage_condition - Storage conditions</li>
              <li>quantity - Number of samples available (positive integer)</li>
              <li>price - Sample price (positive number)</li>
            </ul>
            <p>Optional fields:</p>
            <ul>
              <li>description - Detailed sample description</li>
              <li>latitude - Collection location latitude (-90 to 90)</li>
              <li>longitude - Collection location longitude (-180 to 180)</li>
            </ul>
          </div>

          <div className="upload-section">
            <div className="upload-box">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                id="file-upload"
                className="hidden"
              />
              <label htmlFor="file-upload" className="upload-label">
                <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                <span>Choose CSV file or drag & drop</span>
              </label>
            </div>

            {uploadState.status !== 'idle' && (
              <div className={`upload-status ${uploadState.status}`}>
                <FontAwesomeIcon 
                  icon={uploadState.status === 'success' ? faCheck : uploadState.status === 'error' ? faTimes : faUpload} 
                  className="status-icon"
                />
                <p>{uploadState.message}</p>
                
                {uploadState.errors.length > 0 && (
                  <div className="validation-errors">
                    <h3>Validation Errors:</h3>
                    <ul>
                      {uploadState.errors.map((error, index) => (
                        <li key={index}>
                          Row {error.row}: {error.field} - {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {uploadState.data && (
                  <div className="preview-controls">
                    <button 
                      className="preview-button"
                      onClick={() => setUploadState(prev => ({ ...prev, showPreview: false }))}
                    >
                      <FontAwesomeIcon icon={faEye} /> Hide Preview
                    </button>

                    <button 
                      className="cancel-button"
                      onClick={handleCancel}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      Cancel
                    </button>

                    {uploadState.status === 'validating' && uploadState.errors.length === 0 && (
                      <button 
                        className="upload-button"
                        onClick={handleUpload}
                      >
                        <FontAwesomeIcon icon={faUpload} /> Upload Data
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Preview Table */}
            {uploadState.showPreview && uploadState.data && uploadState.data.length > 0 && (
              <div className="data-preview">
                <div className="table-container">
                  {renderPreviewTable(uploadState.data)}
                </div>
                <div className="preview-controls">
                  <button 
                    className="preview-button" 
                    onClick={() => setUploadState(prev => ({ ...prev, showPreview: false }))}
                  >
                    <FontAwesomeIcon icon={faEye} /> Hide Preview
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    <FontAwesomeIcon icon={faBan} /> Cancel
                  </button>
                  {uploadState.status === 'validating' && uploadState.errors.length === 0 && (
                    <button 
                      className="upload-button"
                      onClick={handleUpload}
                    >
                      <FontAwesomeIcon icon={faUpload} /> Upload Data
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 