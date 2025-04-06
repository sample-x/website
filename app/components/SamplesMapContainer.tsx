'use client';

import { useState, useEffect } from 'react';
import { Sample } from '../types/sample';

interface SamplesMapContainerProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
  onAddToCart?: (sample: Sample) => void;
  selectedSample?: Sample | null;
}

export default function SamplesMapContainer({
  samples,
  onSampleSelect,
  onAddToCart,
  selectedSample
}: SamplesMapContainerProps) {
  return (
    <div style={{
      height: '500px',
      border: '5px solid red',
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
      <h2 style={{ color: 'red', marginBottom: '20px' }}>MAP TEST CONTAINER</h2>
      <p>This is a test container that replaces the actual map</p>
      <p>Samples count: {samples.length}</p>
      <div style={{ 
        marginTop: '20px',
        backgroundColor: 'black',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px'
      }}>
        TIMESTAMP: {new Date().toISOString()}
      </div>
    </div>
  );
} 