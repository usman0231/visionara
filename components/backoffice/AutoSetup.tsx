'use client';

import { useState, useEffect } from 'react';
import LoginClient from '@/app/backoffice/(auth)/login/login-client';

interface SchemaStatus {
  initialized: boolean;
  error?: string;
  missingTables?: string[];
}

export default function AutoSetup() {
  const [status, setStatus] = useState<'checking' | 'initializing' | 'ready' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<SchemaStatus | null>(null);

  useEffect(() => {
    checkAndInitializeSchema();
  }, []);

  const checkAndInitializeSchema = async () => {
    try {
      setStatus('checking');
      setError(null);

      // Check current schema status
      const schemaResponse = await fetch('/api/admin/schema-status');
      const schemaData = await schemaResponse.json();
      
      setSchemaStatus(schemaData);

      if (schemaData.initialized) {
        setStatus('ready');
        return;
      }

      // Schema not initialized, auto-initialize
      setStatus('initializing');
      
      const setupResponse = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const setupData = await setupResponse.json();

      if (!setupResponse.ok) {
        throw new Error(setupData.message || setupData.error || 'Setup failed');
      }

      // Setup successful, schema is now ready
      setStatus('ready');

    } catch (error: any) {
      console.error('Auto-setup error:', error);
      setError(error.message);
      setStatus('error');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <div className="text-center">
              <div className="mb-4">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold mb-2">Checking Database</h1>
              <p className="text-gray-400">Verifying schema initialization...</p>
            </div>
          </div>
        );

      case 'initializing':
        return (
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <div className="text-center">
              <div className="mb-4">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold mb-2">Initializing Database</h1>
              <p className="text-gray-400">Setting up tables and seeding data...</p>
              {schemaStatus?.missingTables && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded text-blue-400 text-sm">
                  <strong>Creating tables:</strong> {schemaStatus.missingTables.join(', ')}
                </div>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold mb-2 text-red-400">Setup Failed</h1>
              <p className="text-gray-400">There was an issue initializing the database.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              onClick={checkAndInitializeSchema}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Retry Setup
            </button>
          </div>
        );

      case 'ready':
        return (
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Visionara Backoffice</h1>
              <p className="text-gray-400">Sign in to manage your site content</p>
            </div>
            
            <LoginClient />
          </div>
        );

      default:
        return null;
    }
  };

  return renderStatus();
}