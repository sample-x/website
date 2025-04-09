'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, faCheck, faTimes, faTable, 
  faEye, faBan, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
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
  latitude?: number | null;
  longitude?: number | null;
  hash?: string;
  institution_name?: string;
  institution_contact_name?: string;
  institution_contact_email?: string;
  status: string;
  [key: string]: string | number | undefined | null;
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
        // More tolerant price validation - allow any non-negative number or convert to 0
        const price = parseFloat(strValue);
        if (isNaN(price)) {
          return {
            row: rowNumber,
            field,
            message: 'Price is not a valid number - will be set to 0'
          };
        } else if (price < 0) {
          return {
            row: rowNumber,
            field,
            message: 'Price must be a positive number - negative values will be converted to positive'
          };
        }
        break;

      case 'quantity':
        // More tolerant quantity validation - allow any number or convert to 1
        const quantity = parseInt(strValue);
        if (isNaN(quantity)) {
          return {
            row: rowNumber,
            field,
            message: 'Quantity is not a valid number - will be set to 1'
          };
        } else if (quantity < 1) {
          return {
            row: rowNumber,
            field,
            message: 'Quantity must be a positive integer - will be set to 1'
          };
        }
        break;

      case 'collection_date':
        // More tolerant date validation with multiple formats
        const dateFormats = [
          /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
          /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
          /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
          /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
          /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
        ];
        
        const isValidDateFormat = dateFormats.some(format => format.test(strValue));
        
        if (!isValidDateFormat && strValue.trim() !== '') {
          return {
            row: rowNumber,
            field,
            message: 'Invalid date format - please use YYYY-MM-DD or other standard formats'
          };
        }
        
        // Don't validate date is in the past - allow future dates
        break;

      case 'latitude':
        if (strValue && strValue.toLowerCase() !== 'null' && strValue !== '') {
          const lat = parseFloat(strValue);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return {
              row: rowNumber,
              field,
              message: 'Latitude must be between -90 and 90 - will be set to null'
            };
          }
        }
        break;

      case 'longitude':
        if (strValue && strValue.toLowerCase() !== 'null' && strValue !== '') {
          const lng = parseFloat(strValue);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return {
              row: rowNumber,
              field,
              message: 'Longitude must be between -180 and 180 - will be set to null'
            };
          }
        }
        break;

      case 'type':
        // More tolerant type validation - dynamically capitalize first letter
        // and allow custom types with warning
        const validTypes = ['bacterial', 'viral', 'fungal', 'tissue', 'environmental', 'cell line', 'soil', 'botanical', 'dna', 'water', 'industrial'];
        const normalizedValue = strValue.toLowerCase().trim();
        
        if (!validTypes.includes(normalizedValue)) {
          // Dynamic type extension - allow but warn
          return {
            row: rowNumber,
            field,
            message: `Type "${strValue}" is not standard - will be added as a new type category`
          };
        }
        break;
    }
    return null;
  };

  // Process and validate samples from CSV
  const processSamples = (headers: string[], rows: string[][]): { samples: SampleData[], errors: ValidationError[], warnings: ValidationError[] } => {
    const samples: SampleData[] = [];
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = []; 
    
    // Define required and optional fields
    const requiredFields = [
      'name', 'type'
    ];
    
    const semiRequiredFields = [
      'location', 'collection_date', 'storage_condition', 'quantity', 'price'
    ];
    
    const optionalFields = [
      'description', 'latitude', 'longitude', 
      'institution_name', 'institution_contact_name', 'institution_contact_email'
    ];

    // Process each row
    rows.forEach((values, rowIndex) => {
      let rowHasError = false; // Flag for critical errors only
      // Map headers to values
      const sample: Partial<SampleData> = {};
      
      // Initialize with defaults for missing fields
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index] ? values[index].trim() : '';
          
          // Handle quoted values (e.g. "value,with,commas")
          if (value.startsWith('"') && value.endsWith('"')) {
            sample[header.toLowerCase()] = value.substring(1, value.length - 1);
          } else {
            sample[header.toLowerCase()] = value;
          }
        }
      });
      
      // Validate strictly required fields
      requiredFields.forEach(field => {
        const value = sample[field];
        if (value === undefined || value === null || String(value).trim() === '') {
          errors.push({
            row: String(rowIndex + 1),
            field: field,
            message: `Missing strictly required field: ${field}`
          });
          rowHasError = true;
        } else if (field === 'type') {
          // Validate type but make it non-blocking
          const validationWarning = validateField(value, field, String(rowIndex + 1));
          if (validationWarning) {
            warnings.push(validationWarning);
            // We'll auto-format type later - no need to mark as error
          }
        }
      });

      // If strictly required fields are missing, skip this sample row
      if (rowHasError) {
        return; 
      }

      // Process semi-required fields and auto-fill with defaults if missing/invalid
      semiRequiredFields.forEach(field => {
        const value = sample[field];
        if (value === undefined || value === null || String(value).trim() === '') {
          warnings.push({
            row: String(rowIndex + 1),
            field: field,
            message: `Missing field: ${field} - will use default value`
          });
          
          // Set default values for missing fields
          switch(field) {
            case 'price':
              sample[field] = 0; // Use number instead of string
              break;
            case 'quantity':
              sample[field] = 1; // Use number instead of string
              break;
            case 'collection_date':
              sample[field] = new Date().toISOString().split('T')[0]; // Today's date
              break;
            case 'location':
              sample[field] = 'Unknown';
              break;
            case 'storage_condition':
              sample[field] = 'Room temperature';
              break;
          }
        } else {
          // Validate format for semi-required fields
          const validationWarning = validateField(value, field, String(rowIndex + 1));
          if (validationWarning) {
            warnings.push(validationWarning);
            
            // Auto-correct the value based on field type
            switch(field) {
              case 'price':
                const price = parseFloat(String(value));
                sample[field] = isNaN(price) ? 0 : Math.abs(price); // Use number instead of string
                break;
              case 'quantity':
                const quantity = parseInt(String(value));
                sample[field] = isNaN(quantity) || quantity < 1 ? 1 : quantity; // Use number instead of string
                break;
              case 'collection_date':
                // Keep original if format is wrong - we'll try to parse it later
                break;
              default:
                // Keep the original value
                break;
            }
          }
        }
      });

      // Validate optional fields
      optionalFields.forEach(field => {
        const value = sample[field];
        if (value !== undefined && String(value).trim() !== '') {
          const validationWarning = validateField(value, field, String(rowIndex + 1));
          if (validationWarning) {
            warnings.push(validationWarning);
            
            // Set invalid optional field to empty/null instead of rejecting row
            if (field === 'latitude' || field === 'longitude') {
                sample[field] = null; // Use null for numeric fields if invalid
            }
          }
        }
      });

      // Normalize and format type - first letter capitalized
      if (sample.type) {
        const words = String(sample.type).split(' ');
        const formattedType = words.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        
        sample.type = formattedType;
      }

      // Try to format collection_date to ISO format if it's not already
      if (sample.collection_date && !/^\d{4}-\d{2}-\d{2}$/.test(sample.collection_date)) {
        try {
          // Try to parse various date formats
          const dateParts = sample.collection_date.split(/[-/.]/);
          let year, month, day;
          
          if (dateParts[0].length === 4) {
            // Assuming YYYY-MM-DD or YYYY/MM/DD
            [year, month, day] = dateParts;
          } else {
            // Assuming DD-MM-YYYY or MM-DD-YYYY or similar
            [day, month, year] = dateParts;
          }
          
          // Create a new date and convert to ISO format
          const date = new Date(`${year}-${month}-${day}`);
          if (!isNaN(date.getTime())) {
            sample.collection_date = date.toISOString().split('T')[0];
          }
        } catch (e) {
          // If parsing fails, keep the original and it will warn the user
          console.warn("Failed to parse date:", sample.collection_date);
        }
      }

      // Create a complete sample object with potentially corrected fields
      const completeSample = {
        name: String(sample.name || ''),
        type: String(sample.type || ''),
        location: String(sample.location || 'Unknown'),
        collection_date: String(sample.collection_date || new Date().toISOString().split('T')[0]),
        storage_condition: String(sample.storage_condition || 'Room temperature'),
        quantity: typeof sample.quantity === 'number' ? sample.quantity : parseInt(String(sample.quantity || '1'), 10),
        price: typeof sample.price === 'number' ? sample.price : parseFloat(String(sample.price || '0')),
        description: String(sample.description || ''),
        latitude: sample.latitude === null || sample.latitude === undefined || String(sample.latitude).toLowerCase() === 'null' ? 
          null : parseFloat(String(sample.latitude)),
        longitude: sample.longitude === null || sample.longitude === undefined || String(sample.longitude).toLowerCase() === 'null' ? 
          null : parseFloat(String(sample.longitude)),
        institution_name: String(sample.institution_name || ''),
        institution_contact_name: String(sample.institution_contact_name || ''),
        institution_contact_email: String(sample.institution_contact_email || ''),
        status: 'private' // Set default status
      } as SampleData;

      samples.push(completeSample);
    });
    
    return { samples, errors, warnings };
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
        
        // Only check for these essential fields
        const requiredFields = ['name', 'type'];

        // Validate headers
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields);
          setUploadState({
            status: 'error',
            message: `Missing essential fields: ${missingFields.join(', ')}. CSV must contain at least 'name' and 'type' columns.`,
            data: null,
            errors: [],
            showPreview: false
          });
          return;
        }

        // Parse data rows - handle quoted values properly
        const rows: string[][] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue);
          rows.push(values);
        }
        
        console.log(`Parsed ${rows.length} data rows`);
        
        // Process and validate the samples
        const { samples, errors, warnings } = processSamples(headers, rows);
        
        // Combine errors and warnings for reporting
        const allIssues = [...errors, ...warnings];
        
        console.log(`Processed into ${samples.length} valid samples with ${errors.length} errors and ${warnings.length} warnings`);
        
        if (errors.length > 0) {
          // Critical errors found - block upload
          setUploadState({
            status: 'error',
            message: `Found ${errors.length} critical validation errors that prevent upload.`,
            data: null, // Do not provide data for upload if errors exist
            errors: allIssues, // Show all issues
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
          // Samples are valid for upload, may have warnings
          setUploadState({
            status: 'validating',
            message: `Found ${samples.length} samples ready for upload` + (warnings.length > 0 ? ` with ${warnings.length} warnings that were auto-corrected.` : '.'),
            data: samples, // Provide data for upload
            errors: warnings.length > 0 ? warnings : [], // Only show warnings if there are any
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
          institution_contact_email: sample.institution_contact_email || user?.email || '',
          status: 'private' // Set default status
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