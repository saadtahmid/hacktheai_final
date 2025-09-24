import React, { useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', duration?: number) => void;
} | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration: number = 4000
  ) => {
    const id = Math.random().toString();
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      default: return 'bg-blue-100 border-blue-400 text-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-lg border-l-4 p-4 shadow-lg transition-all duration-300 animate-slide-in ${getToastColors(toast.type)}`}
          >
            <div className="flex items-start">
              <span className="mr-2 text-lg">{getToastIcon(toast.type)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};