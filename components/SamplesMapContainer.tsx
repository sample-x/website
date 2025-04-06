'use client';

import { useState } from 'react';
import { Sample } from '@/types/sample';

interface SamplesMapContainerProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
}

export default function SamplesMapContainer({
  samples,
  onSampleSelect,
}: SamplesMapContainerProps) {
  return (
    <div style={{
      height: '500px',
      border: '5px solid blue',
      backgroundColor: '#f0f0f0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      padding: '20px',
      margin: '20px 0'
    }}>
      <h2 style={{ color: 'blue', marginBottom: '20px' }}>COMPONENTS MAP TEST</h2>
      <p>This is a test container from components/SamplesMapContainer.tsx</p>
      <p>Samples count: {samples.length}</p>
      <div style={{ 
        marginTop: '20px',
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px'
      }}>
        TIMESTAMP: {new Date().toISOString()}
      </div>
    </div>
  );
} 