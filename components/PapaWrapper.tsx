'use client';

import React, { useState } from 'react';

interface PapaWrapperProps {
  onComplete: (results: any) => void;
  onError: (error: any) => void;
  children: React.ReactNode;
}

// Simplified version for static export
export default function PapaWrapper({ onComplete, onError, children }: PapaWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Simple CSV parsing for static export
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const results = {
        data: lines.slice(1).map(line => {
          const values = line.split(',');
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          
          return row;
        }),
        errors: [],
        meta: { fields: headers }
      };
      
      onComplete(results);
    } catch (error) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clone children and add the file handling prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onFileUpload: handleFileUpload,
        isProcessing
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
} 