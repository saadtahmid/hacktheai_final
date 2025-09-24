import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationCenter } from './index';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Jonoshongjog',
  showNotifications = true
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className="bg-white dark:bg-gray-800 px-6 py-4"
    >
      <div
        className="flex items-center justify-between"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {/* Left side - Logo and Title */}
        <div
          className="flex items-center space-x-4"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div
            className="flex items-center space-x-2"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center"
              style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(to right, #3b82f6, #10b981)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span
                className="text-white font-bold text-lg"
                style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}
              >
                J
              </span>
            </div>
            <h1
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {title}
            </h1>
          </div>
          {user && (
            <div
              className="hidden md:block px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
            >
              <span
                className="text-sm text-blue-800 dark:text-blue-200 capitalize"
              >
                {user.user_type} Dashboard
              </span>
            </div>
          )}
        </div>

        {/* Right side - User controls */}
        <div
          className="flex items-center space-x-4"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          {/* Language Switcher - Functional version */}
          <div
            className="hidden md:flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1"
            style={{
              display: window.innerWidth >= 768 ? 'flex' : 'none',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '0.25rem'
            }}
          >
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm rounded transition-colors ${language === 'en'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s',
                backgroundColor: language === 'en' ? 'white' : 'transparent',
                color: language === 'en' ? '#8b5cf6' : '#6b7280',
                boxShadow: language === 'en' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-sm rounded transition-colors ${language === 'bn'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s',
                backgroundColor: language === 'bn' ? 'white' : 'transparent',
                color: language === 'bn' ? '#8b5cf6' : '#6b7280',
                boxShadow: language === 'bn' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Noto Sans Bengali, system-ui, sans-serif'
              }}
            >
              বাং
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          {showNotifications && user && (
            <NotificationCenter />
          )}

          {/* User Info and Logout */}
          {user && (
            <div
              className="flex items-center space-x-3"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div
                className="hidden md:block text-right"
                style={{
                  display: window.innerWidth >= 768 ? 'block' : 'none',
                  textAlign: 'right'
                }}
              >
                <p
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {user.full_name || 'User'}
                </p>
                <p
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {user.email || user.phone}
                </p>
              </div>

              <div
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  className="text-white font-medium text-sm"
                  style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  {(user.full_name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors"
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                {t('header.logout')}
              </button>
            </div>
          )}

          {!user && (
            <div
              className="flex items-center space-x-2"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span
                className="text-sm text-gray-500 dark:text-gray-400"
                style={{ fontSize: '0.875rem', color: '#6b7280' }}
              >
                {t('header.welcome')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;