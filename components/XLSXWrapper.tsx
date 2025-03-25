'use client';

import React, { useState } from 'react';

interface XLSXWrapperProps {
  onComplete: (results: any) => void;
  onError: (error: any) => void;
  children: React.ReactNode;
}

// Simplified version for static export
export default function XLSXWrapper({ onComplete, onError, children }: XLSXWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // For static export, we'll just show a message that this feature requires JavaScript
      onComplete({
        data: [{ message: 'Excel import requires client-side JavaScript' }],
        errors: [],
        meta: { fields: ['message'] }
      });
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