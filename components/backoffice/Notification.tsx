'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Notification({ show, message, type, onClose }: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg shadow-lg backdrop-blur-lg border border-white/20 p-4 transition-all duration-300 ${
        type === 'success'
          ? 'bg-emerald-50/90 border-emerald-200/50'
          : 'bg-red-50/90 border-red-200/50'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 transition-colors ${
                type === 'success'
                  ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                  : 'text-red-500 hover:bg-red-100 focus:ring-red-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}