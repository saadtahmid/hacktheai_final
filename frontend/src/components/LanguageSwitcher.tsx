import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme, getThemeColors } from './ThemeProvider';

interface LanguageSwitcherProps {
  currentLanguage: 'bn' | 'en';
  onLanguageChange: (language: 'bn' | 'en') => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <ThemeToggle />
      <button
        onClick={() => onLanguageChange('bn')}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shadow-md ${currentLanguage === 'bn'
            ? 'bg-green-600 text-white shadow-lg'
            : 'hover:bg-green-50 hover:text-green-700 border border-green-200'
          }`}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '700',
          borderRadius: '0.5rem',
          transition: 'all 0.3s ease',
          boxShadow: currentLanguage === 'bn' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          backgroundColor: currentLanguage === 'bn' ? '#16a34a' : colors.bg.primary,
          color: currentLanguage === 'bn' ? 'white' : colors.text.primary,
          border: currentLanguage === 'bn' ? 'none' : `1px solid ${colors.green.border}`
        }}
      >
        বাংলা
      </button>
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shadow-md ${currentLanguage === 'en'
            ? 'bg-green-600 text-white shadow-lg'
            : 'hover:bg-green-50 hover:text-green-700 border border-green-200'
          }`}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '700',
          borderRadius: '0.5rem',
          transition: 'all 0.3s ease',
          boxShadow: currentLanguage === 'en' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          backgroundColor: currentLanguage === 'en' ? '#16a34a' : colors.bg.primary,
          color: currentLanguage === 'en' ? 'white' : colors.text.primary,
          border: currentLanguage === 'en' ? 'none' : `1px solid ${colors.green.border}`
        }}
      >
        English
      </button>
    </div>
  );
};

// Translation helper hook
export const useTranslation = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('en');

  const translations = {
    // Home Screen
    home: {
      title: {
        bn: 'জনসংযোগ - ত্রাণ বিতরণ প্ল্যাটফর্ম',
        en: 'Jonoshongjog - Relief Distribution Platform'
      },
      subtitle: {
        bn: 'দুর্যোগ ও দারিদ্র্য মোকাবেলায় কৃত্রিম বুদ্ধিমত্তা চালিত সমাধান',
        en: 'AI-Powered Solution for Disaster Relief and Poverty Alleviation'
      },
      selectRole: {
        bn: 'আপনার ভূমিকা নির্বাচন করুন',
        en: 'Select Your Role'
      },
      roles: {
        donor: {
          title: { bn: 'দাতা', en: 'Donor' },
          description: { bn: 'খাদ্য, কাপড়, ওষুধ দান করুন', en: 'Donate food, clothes, medicine' },
          button: { bn: 'দান করুন', en: 'Donate Now' }
        },
        ngo: {
          title: { bn: 'এনজিও/সংস্থা', en: 'NGO/Organization' },
          description: { bn: 'ত্রাণ সামগ্রী অনুরোধ করুন', en: 'Request relief supplies' },
          button: { bn: 'অনুরোধ করুন', en: 'Request Items' }
        },
        volunteer: {
          title: { bn: 'স্বেচ্ছাসেবক', en: 'Volunteer' },
          description: { bn: 'পিকআপ ও ডেলিভারি', en: 'Pickup & delivery service' },
          button: { bn: 'সেবা করুন', en: 'Start Volunteering' }
        }
      },
      features: {
        title: { bn: 'আমাদের বৈশিষ্ট্যসমূহ', en: 'Our Features' },
        validation: { bn: 'AI চালিত যাচাইকরণ', en: 'AI-Powered Validation' },
        matching: { bn: 'স্মার্ট ম্যাচিং', en: 'Smart Matching' },
        optimization: { bn: 'রুট অপটিমাইজেশন', en: 'Route Optimization' },
        realtime: { bn: 'রিয়েল-টাইম আপডেট', en: 'Real-time Updates' }
      }
    },
    // Common terms
    common: {
      next: { bn: 'পরবর্তী', en: 'Next' },
      back: { bn: 'পিছনে', en: 'Back' },
      submit: { bn: 'জমা দিন', en: 'Submit' },
      cancel: { bn: 'বাতিল', en: 'Cancel' },
      save: { bn: 'সংরক্ষণ', en: 'Save' },
      loading: { bn: 'লোড হচ্ছে...', en: 'Loading...' },
      error: { bn: 'ত্রুটি ঘটেছে', en: 'An error occurred' },
      success: { bn: 'সফল', en: 'Success' }
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return value?.[language] || key;
  };

  return { language, setLanguage, t };
};