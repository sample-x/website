'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { testSupabaseConnection } from '@/app/lib/supabase';

export default function SupabaseConnectionTest() {
  const { supabase } = useSupabase();
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: 'Not tested yet'
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testSupabaseConnection();
        setConnectionStatus({
          tested: true,
          success: result.success,
          message: result.success 
            ? 'Successfully connected to Supabase' 
            : `Connection failed: ${result.error}`
        });
      } catch (error) {
        setConnectionStatus({
          tested: true,
          success: false,
          message: `Error testing connection: ${(error as Error).message}`
        });
      }
    }

    checkConnection();
  }, [supabase]);

  return (
    <div className="supabase-connection-test">
      <h3>Supabase Connection Status</h3>
      <div className={`connection-status ${connectionStatus.success ? 'success' : 'error'}`}>
        <div className="status-indicator"></div>
        <div className="status-message">
          {connectionStatus.message}
        </div>
      </div>
      <style jsx>{`
        .supabase-connection-test {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 8px;
          background-color: #f4f5f8;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 4px;
        }
        
        .success {
          background-color: rgba(40, 167, 69, 0.1);
        }
        
        .error {
          background-color: rgba(220, 53, 69, 0.1);
        }
        
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 10px;
        }
        
        .success .status-indicator {
          background-color: #28a745;
        }
        
        .error .status-indicator {
          background-color: #dc3545;
        }
        
        .status-message {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
} 