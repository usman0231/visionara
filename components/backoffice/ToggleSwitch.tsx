'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  onToggle?: (enabled: boolean) => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNotification?: (message: string, type: 'success' | 'error') => void;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  title?: string;
}

export default function ToggleSwitch({
  enabled,
  onChange,
  onToggle,
  disabled = false,
  size = 'md',
  showNotification,
  successMessage,
  errorMessage,
  className = '',
  title
}: ToggleSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translate: enabled ? 'translate-x-5' : 'translate-x-1'
    },
    md: {
      container: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: enabled ? 'translate-x-6' : 'translate-x-1'
    },
    lg: {
      container: 'h-7 w-13',
      thumb: 'h-5 w-5',
      translate: enabled ? 'translate-x-7' : 'translate-x-1'
    }
  };

  const config = sizeConfig[size];

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    if (onToggle) {
      setIsLoading(true);
      try {
        await onToggle(!enabled);
        onChange(!enabled);

        if (showNotification && successMessage) {
          showNotification(successMessage, 'success');
        } else if (showNotification) {
          showNotification(
            `${!enabled ? 'Enabled' : 'Disabled'} successfully`,
            'success'
          );
        }
      } catch (error) {
        console.error('Toggle error:', error);
        if (showNotification && errorMessage) {
          showNotification(errorMessage, 'error');
        } else if (showNotification) {
          showNotification('Failed to update status', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      onChange(!enabled);
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={`relative inline-flex ${config.container} items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 transform shadow-lg backdrop-blur-sm border border-white/30 ${
          disabled || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 cursor-pointer'
        } ${
          enabled
            ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 focus:ring-emerald-300'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
        }`}
        title={title || (enabled ? 'Active - Click to disable' : 'Inactive - Click to enable')}
      >
        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Toggle thumb */}
        <span
          className={`inline-block ${config.thumb} transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out border border-white/60 backdrop-blur-sm ${
            config.translate
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      </button>
    </div>
  );
}