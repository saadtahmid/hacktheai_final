import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTranslation, LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.1 }
};

const containerVariants = {
  initial: { opacity: 0 },
  in: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  in: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const formVariants = {
  initial: { opacity: 0, x: -20 },
  in: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 }
  }
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const { language, setLanguage } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    user_type: 'donor' as 'donor' | 'ngo' | 'volunteer',
    organization_name: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLoginMode) {
        await login(formData.phone, formData.password);
        // Just redirect to home - the auth context will be updated and 
        // the user will be automatically redirected to their dashboard
        navigate('/');
      } else {
        await register(formData);
        // Same for registration
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        minHeight: '100vh',
        background: colors.bg.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
    >

      <motion.div
        className="max-w-md w-full space-y-8"
        style={{ maxWidth: '28rem', width: '100%' }}
        variants={containerVariants}
        initial="initial"
        animate="in"
      >
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                color: colors.green.primary,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <svg className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
              </span>
            </motion.button>
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>

          <motion.h2
            className="mt-6 text-center text-3xl font-black bangla-text"
            style={{ color: colors.text.primary, fontSize: '1.875rem', fontWeight: '900', textAlign: 'center' }}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            {isLoginMode
              ? (language === 'bn' ? 'লগইন করুন' : 'Sign In')
              : (language === 'bn' ? 'নিবন্ধন করুন' : 'Sign Up')
            }
          </motion.h2>
          <motion.p
            className="mt-2 text-center bangla-text"
            style={{ color: colors.text.secondary, textAlign: 'center' }}
            variants={itemVariants}
          >
            {language === 'bn'
              ? 'জনসংযোগ প্ল্যাটফর্মে স্বাগতম'
              : 'Welcome to Jonoshongjog Platform'
            }
          </motion.p>
        </motion.div>

        <motion.form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          variants={formVariants}
          initial="initial"
          animate="in"
        >
          <motion.div
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}
            whileHover={{
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              transition: { duration: 0.3 }
            }}
          >

            {error && (
              <div className="mb-4 rounded-lg p-4 border-l-4"
                style={{
                  backgroundColor: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  color: '#dc2626',
                  marginBottom: '1rem'
                }}>
                <p className="text-sm font-medium bangla-text">{error}</p>
              </div>
            )}

            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {!isLoginMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 bangla-text"
                      style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                      {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required={!isLoginMode}
                      className="w-full px-3 py-2 border rounded-lg bangla-text"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: colors.bg.primary,
                        color: colors.text.primary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: '0.5rem',
                        outline: 'none'
                      }}
                      placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 bangla-text"
                      style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                      {language === 'bn' ? 'ব্যবহারকারীর ধরন' : 'User Type'} *
                    </label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg bangla-text"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: colors.bg.primary,
                        color: colors.text.primary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: '0.5rem',
                        outline: 'none'
                      }}
                    >
                      <option value="donor">{language === 'bn' ? 'দাতা' : 'Donor'}</option>
                      <option value="ngo">{language === 'bn' ? 'এনজিও' : 'NGO'}</option>
                      <option value="volunteer">{language === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteer'}</option>
                    </select>
                  </div>

                  {formData.user_type === 'ngo' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 bangla-text"
                        style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                        {language === 'bn' ? 'সংস্থার নাম' : 'Organization Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.organization_name}
                        onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bangla-text"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0.5rem',
                          outline: 'none'
                        }}
                        placeholder={language === 'bn' ? 'আপনার সংস্থার নাম' : 'Your organization name'}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 bangla-text"
                  style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: colors.bg.primary,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 bangla-text"
                  style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: colors.bg.primary,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড' : 'Your password'}
                />
              </div>

              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium mb-1 bangla-text"
                    style={{ color: colors.text.secondary, fontSize: '0.875rem', fontWeight: '500' }}>
                    {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: colors.bg.primary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.primary}`,
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                    placeholder="your@email.com"
                  />
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 text-lg font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                borderRadius: '0.5rem',
                backgroundColor: loading ? '#d1d5db' : '#16a34a',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading
                ? (language === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...')
                : isLoginMode
                  ? (language === 'bn' ? 'লগইন করুন' : 'Sign In')
                  : (language === 'bn' ? 'নিবন্ধন করুন' : 'Sign Up')
              }
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-green-600 hover:text-green-700 bangla-text"
                style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isLoginMode
                  ? (language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create new account')
                  : (language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign in')
                }
              </button>
            </div>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default AuthPage;