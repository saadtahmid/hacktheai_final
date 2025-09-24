import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher, useTranslation } from '../components';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { isAuthenticated, user, logout } = useAuth();

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.user_type) {
        case 'donor':
          navigate('/donor');
          break;
        case 'ngo':
          navigate('/ngo');
          break;
        case 'volunteer':
          navigate('/volunteer');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Helper function to check if user can access a specific role
  const canAccessRole = (role: string): boolean => {
    if (!isAuthenticated || !user) return true; // Unauthenticated users can see all options (will be redirected to auth)
    return user.user_type === role;
  };

  // Helper function to get appropriate styling for role cards
  const getRoleCardStyling = (role: string) => {
    const baseStyle = {
      backgroundColor: colors.bg.tertiary,
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center' as const,
      boxShadow: colors.shadow,
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    if (!canAccessRole(role)) {
      return {
        ...baseStyle,
        opacity: '0.5',
        cursor: 'not-allowed',
        backgroundColor: colors.bg.secondary
      };
    }

    return baseStyle;
  };

  const handleRoleSelect = (role: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // If user is authenticated, check if they're trying to access their own role's dashboard
    if (user) {
      // Users can only access their own role's dashboard
      if (user.user_type === 'donor' && role === 'donor') {
        navigate('/donor');
      } else if (user.user_type === 'ngo' && role === 'ngo') {
        navigate('/ngo-request');
      } else if (user.user_type === 'volunteer' && role === 'volunteer') {
        navigate('/volunteer-dashboard');
      } else {
        // User is trying to access a different role's dashboard
        // Redirect them to their own dashboard
        switch (user.user_type) {
          case 'donor':
            navigate('/donor');
            break;
          case 'ngo':
            navigate('/ngo-request');
            break;
          case 'volunteer':
            navigate('/volunteer-dashboard');
            break;
          default:
            // Stay on home page if unknown role
            break;
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white" style={{ minHeight: '100vh', background: colors.bg.gradient }}>
      {/* Header */}
      <header
        className="bg-white shadow-lg border-b-2 border-green-100"
        style={{ backgroundColor: colors.bg.primary, boxShadow: colors.shadow, borderBottom: `2px solid ${colors.border.accent}` }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}
        >
          <div
            className="flex justify-between items-center"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h1
              className="text-3xl font-black text-gray-900 bangla-text tracking-tight"
              style={{ fontSize: '1.875rem', fontWeight: '900', color: colors.text.primary, letterSpacing: '-0.025em' }}
            >
              {t('home.title')}
            </h1>

            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="bangla-text font-medium" style={{ color: colors.text.primary, fontWeight: '500' }}>
                    {language === 'bn' ? 'স্বাগতম, ' : 'Welcome, '}{user.full_name}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium rounded-lg border hover:bg-red-50"
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '0.5rem',
                      border: `1px solid ${colors.border.primary}`,
                      backgroundColor: colors.bg.primary,
                      color: colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {language === 'bn' ? 'লগআউট' : 'Logout'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 font-medium rounded-lg bg-green-600 text-white hover:bg-green-700"
                  style={{
                    padding: '0.5rem 1rem',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    backgroundColor: colors.green.primary,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </button>
              )}

              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50"
        style={{ minHeight: '100vh', background: colors.bg.gradient }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1rem' }}>
          {/* Hero Section */}
          <div
            className="text-center mb-16"
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2
              className="text-5xl font-black mb-6 bangla-text leading-tight"
              style={{ fontSize: '3rem', fontWeight: '900', color: colors.text.primary, marginBottom: '1.5rem', lineHeight: '1.1' }}
            >
              {t('home.title')}
            </h2>
            <p
              className="text-2xl max-w-4xl mx-auto bangla-text font-medium leading-relaxed"
              style={{ fontSize: '1.5rem', color: colors.text.secondary, maxWidth: '56rem', margin: '0 auto', fontWeight: '500', lineHeight: '1.6' }}
            >
              {t('home.subtitle')}
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-16" style={{ marginBottom: '4rem' }}>
            <h3 className="text-3xl font-bold text-center mb-12 bangla-text" style={{ fontSize: '1.875rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: colors.text.primary }}>
              {t('home.selectRole')}
            </h3>

            <div className="grid md:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Donor Card */}
              <div
                onClick={() => canAccessRole('donor') ? handleRoleSelect('donor') : undefined}
                className={`rounded-xl shadow-lg p-8 text-center border-2 border-transparent transition-all duration-300 ${canAccessRole('donor')
                    ? 'hover:border-green-300 hover:shadow-2xl hover:scale-105 cursor-pointer group'
                    : 'cursor-not-allowed'
                  }`}
                style={getRoleCardStyling('donor')}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300"
                    style={{
                      width: '5rem',
                      height: '5rem',
                      backgroundColor: colors.green.bg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <svg className="w-10 h-10" style={{ width: '2.5rem', height: '2.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3 bangla-text" style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.75rem' }}>
                    {t('home.roles.donor.title')}
                  </h4>
                  <p className="text-base bangla-text leading-relaxed" style={{ color: colors.text.secondary, fontSize: '1rem', lineHeight: '1.6' }}>
                    {t('home.roles.donor.description')}
                  </p>
                </div>
                <button
                  className="w-full hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    width: '100%',
                    backgroundColor: colors.green.primary,
                    color: 'white',
                    fontWeight: '700',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: colors.shadow
                  }}
                >
                  {t('home.roles.donor.button')}
                </button>
              </div>

              {/* NGO Card */}
              <div
                onClick={() => canAccessRole('ngo') ? handleRoleSelect('ngo') : undefined}
                className={`rounded-xl shadow-lg p-8 text-center border-2 border-transparent transition-all duration-300 ${canAccessRole('ngo')
                    ? 'hover:border-green-300 hover:shadow-2xl hover:scale-105 cursor-pointer group'
                    : 'cursor-not-allowed'
                  }`}
                style={getRoleCardStyling('ngo')}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300"
                    style={{
                      width: '5rem',
                      height: '5rem',
                      backgroundColor: colors.green.bg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <svg className="w-10 h-10" style={{ width: '2.5rem', height: '2.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3 bangla-text" style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.75rem' }}>
                    {t('home.roles.ngo.title')}
                  </h4>
                  <p className="text-base bangla-text leading-relaxed" style={{ color: colors.text.secondary, fontSize: '1rem', lineHeight: '1.6' }}>
                    {t('home.roles.ngo.description')}
                  </p>
                </div>
                <button
                  className="w-full hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    width: '100%',
                    backgroundColor: colors.green.primary,
                    color: 'white',
                    fontWeight: '700',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: colors.shadow
                  }}
                >
                  {t('home.roles.ngo.button')}
                </button>
              </div>

              {/* Volunteer Card */}
              <div
                onClick={() => canAccessRole('volunteer') ? handleRoleSelect('volunteer') : undefined}
                className={`rounded-xl shadow-lg p-8 text-center border-2 border-transparent transition-all duration-300 ${canAccessRole('volunteer')
                    ? 'hover:border-green-300 hover:shadow-2xl hover:scale-105 cursor-pointer group'
                    : 'cursor-not-allowed'
                  }`}
                style={getRoleCardStyling('volunteer')}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300"
                    style={{
                      width: '5rem',
                      height: '5rem',
                      backgroundColor: colors.green.bg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <svg className="w-10 h-10" style={{ width: '2.5rem', height: '2.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3 bangla-text" style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.75rem' }}>
                    {t('home.roles.volunteer.title')}
                  </h4>
                  <p className="text-base bangla-text leading-relaxed" style={{ color: colors.text.secondary, fontSize: '1rem', lineHeight: '1.6' }}>
                    {t('home.roles.volunteer.description')}
                  </p>
                </div>
                <button
                  className="w-full hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    width: '100%',
                    backgroundColor: colors.green.primary,
                    color: 'white',
                    fontWeight: '700',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: colors.shadow
                  }}
                >
                  {t('home.roles.volunteer.button')}
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="text-center rounded-2xl shadow-lg p-12 mx-4" style={{ backgroundColor: colors.bg.tertiary, borderRadius: '1rem', boxShadow: colors.shadow, padding: '3rem', margin: '0 1rem' }}>
            <h3 className="text-3xl font-bold mb-12 bangla-text" style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '3rem', color: colors.text.primary }}>
              {t('home.features.title')}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div className="p-6" style={{ padding: '1.5rem' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg className="w-8 h-8" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-base bangla-text font-medium" style={{ fontSize: '1rem', color: colors.text.secondary, fontWeight: '500' }}>
                  {t('home.features.validation')}
                </p>
              </div>
              <div className="p-6" style={{ padding: '1.5rem' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg className="w-8 h-8" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 8l8 8M16 8l-8 8" />
                  </svg>
                </div>
                <p className="text-base bangla-text font-medium" style={{ fontSize: '1rem', color: colors.text.secondary, fontWeight: '500' }}>
                  {t('home.features.matching')}
                </p>
              </div>
              <div className="p-6" style={{ padding: '1.5rem' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg className="w-8 h-8" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-base bangla-text font-medium" style={{ fontSize: '1rem', color: colors.text.secondary, fontWeight: '500' }}>
                  {t('home.features.optimization')}
                </p>
              </div>
              <div className="p-6" style={{ padding: '1.5rem' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg className="w-8 h-8" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-base bangla-text font-medium" style={{ fontSize: '1rem', color: colors.text.secondary, fontWeight: '500' }}>
                  {t('home.features.realtime')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;