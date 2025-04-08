'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck, faTimes, faTable, faEye, faBan, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './upload.css';
import { isStaticExport } from '@/app/lib/staticData';
import { useAuth } from '@/app/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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
  institution_name?: string;
  institution_contact_name?: string;
  institution_contact_email?: string;
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

// Function to generate a hash for a sample - now only used for local processing
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
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const [isStatic, setIsStatic] = useState(false);
  const [forceDynamicMode, setForceDynamicMode] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    message: '',
    data: null,
    errors: [],
    showPreview: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    // Wait until authentication state is fully loaded
    if (!isLoading && !user) {
      toast.info('Please log in to upload samples');
      router.push('/login?redirect=/samples/upload');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Check if we're in static mode
    const staticMode = isStaticExport();
    
    // Override with forceDynamicMode if set
    setIsStatic(staticMode && !forceDynamicMode);
    
    // Persist the setting to localStorage for other components
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('forceDynamicMode', forceDynamicMode ? 'true' : 'false');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [forceDynamicMode]);

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

  // Process and validate samples from CSV
  const processSamples = (headers: string[], rows: string[][]): { samples: SampleData[], errors: ValidationError[] } => {
    const samples: SampleData[] = [];
    const errors: ValidationError[] = [];
    
    // Process each row
    rows.forEach((values, rowIndex) => {
      // Map headers to values
      const sample: Partial<SampleData> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index].trim();
          
          switch (header) {
            case 'price':
            case 'quantity':
            case 'latitude':
            case 'longitude':
              // Parse numeric fields
              sample[header] = value ? parseFloat(value) : undefined;
              break;
            default:
              // Store as string
              sample[header] = value || undefined;
          }
        }
      });
      
      // Validate required fields
      const requiredFields = [
        'name', 'type', 'location', 'collection_date', 
        'storage_condition', 'quantity', 'price'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !sample[field] && sample[field] !== 0
      );
      
      if (missingFields.length > 0) {
        errors.push({
          row: String(rowIndex + 1),
          field: missingFields.join(', '),
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return; // Skip this sample
      }
      
      // Validate each field
      for (const field in sample) {
        const validationError = validateField(sample[field], field, String(rowIndex + 1));
        if (validationError) {
          errors.push(validationError);
        }
      }
      
      // If there are no errors for this row, add it to samples
      if (!errors.some(e => e.row === String(rowIndex + 1))) {
        // Create a complete sample object with all fields
        const completeSample = {
          name: sample.name || '',
          type: sample.type || '',
          location: sample.location || '',
          collection_date: sample.collection_date || '',
          storage_condition: sample.storage_condition || '',
          quantity: sample.quantity || 0,
          price: sample.price || 0,
          description: sample.description,
          latitude: sample.latitude,
          longitude: sample.longitude
        } as SampleData;
        
        samples.push(completeSample);
      }
    });
    
    return { samples, errors };
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

        // Parse data rows
        const rows = lines.slice(1).map(line => {
          return line.split(',').map(value => value.trim());
        });
        
        console.log(`Parsed ${rows.length} data rows`);
        
        // Process and validate the samples
        const { samples, errors } = processSamples(headers, rows);
        
        console.log(`Processed into ${samples.length} valid samples with ${errors.length} errors`);
        
        if (errors.length > 0) {
          setUploadState({
            status: 'error',
            message: `Found ${errors.length} validation errors.`,
            data: samples,
            errors: errors,
            showPreview: true
          });
        } else if (samples.length === 0) {
          setUploadState({
            status: 'error',
            message: 'No valid samples found in the file.',
            data: null,
            errors: [],
            showPreview: false
          });
        } else {
          setUploadState({
            status: 'validating',
            message: `Found ${samples.length} valid samples.`,
            data: samples,
            errors: [],
            showPreview: true
          });
        }
      } catch (error) {
        console.error('CSV validation error:', error);
        setUploadState({
          status: 'error',
          message: `Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`,
          data: null,
          errors: [],
          showPreview: false
        });
      }
    };
    
    reader.onerror = () => {
      setUploadState({
        status: 'error',
        message: 'Error reading the file.',
        data: null,
        errors: [],
        showPreview: false
      });
    };
    
    reader.readAsText(file);
  };

  const handleLoadLocalCSV = async () => {
    try {
      setUploadState(prevState => ({
        ...prevState,
        status: 'validating',
        message: 'Loading pre-existing CSV data...'
      }));
      
      // Fetch the CSV file
      const response = await fetch('/data/samples_combined.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      
      const text = await response.text();
      
      // Process it as if it was uploaded
      const file = new File([text], 'samples_combined.csv', { type: 'text/csv' });
      
      // Use the existing validation function
      validateCSV(file);
    } catch (error) {
      console.error('Error loading local CSV:', error);
      setUploadState(prevState => ({
        ...prevState,
        status: 'error',
        message: 'Failed to load the local CSV file: ' + (error instanceof Error ? error.message : String(error))
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadState.data || isStatic) return;
    
    try {
      setUploadState({
        ...uploadState,
        status: 'uploading',
        message: 'Uploading samples...'
      });
      
      console.log(`Uploading ${uploadState.data.length} samples to Supabase...`);
      
      // Process each sample to remove hash field and add user_id and owner info
      const processedData = uploadState.data.map(sample => {
        // Create a new object without the hash field
        const { hash, ...cleanSample } = sample;
        
        // Add user ID for ownership and set the owner ID
        return {
          ...cleanSample,
          user_id: user?.id,
          sample_owner_id: user?.id,
          // If these are not in the CSV, use user profile values as defaults
          institution_name: sample.institution_name || profile?.institution || '',
          institution_contact_name: sample.institution_contact_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          institution_contact_email: sample.institution_contact_email || user?.email || ''
        };
      });

      // Log the first sample to debug
      console.log('Sample structure:', processedData.length > 0 ? processedData[0] : 'No samples');
      
      const { data, error } = await supabase
        .from('samples')
        .insert(processedData);
      
      if (error) {
        console.error('Error uploading samples:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      setUploadState({
        ...uploadState,
        status: 'success',
        message: `Successfully uploaded ${uploadState.data.length} samples.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        ...uploadState,
        status: 'error',
        message: `Error uploading samples: ${(error as Error).message}`
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
    <div className="upload-page">
      <div className="upload-container">
        <h1>Upload Samples</h1>
        
        {isStatic ? (
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
        ) : (
          <div className="dynamic-mode-notice" style={{
            display: 'flex',
            background: '#d1fae5',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <FontAwesomeIcon icon={faCheck} />
            <div>
              <h3>Live Mode</h3>
              <p>
                You are using live mode. Sample uploads will be stored in your Supabase database.
              </p>
            </div>
          </div>
        )}
        
        <div className="mode-toggle" style={{marginBottom: '20px'}}>
          <button 
            onClick={() => setForceDynamicMode(!forceDynamicMode)}
            className="btn btn-primary"
            style={{
              background: forceDynamicMode ? '#047857' : '#6b7280',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {forceDynamicMode ? 'Using Live Mode' : 'Switch to Live Mode'}
          </button>
          <p style={{
            fontSize: '0.875rem',
            color: '#4b5563',
            marginTop: '0.5rem'
          }}>
            {forceDynamicMode 
              ? 'Uploads will be saved to your actual Supabase database.' 
              : 'Click to override demo mode and use your real Supabase connection.'}
          </p>
        </div>

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
        
        <button 
          onClick={handleLoadLocalCSV}
          className="btn btn-secondary"
          style={{marginBottom: '20px', width: '100%'}}
        >
          <FontAwesomeIcon icon={faTable} style={{marginRight: '8px'}} />
          Load Built-in Sample Data
        </button>

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