import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first, then default to English
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const translations = {
    // Header translations
    header: {
      welcome: {
        en: 'Welcome to Jonoshongjog',
        bn: 'জনসংযোগে স্বাগতম'
      },
      logout: {
        en: 'Logout',
        bn: 'লগআউট'
      },
      notifications: {
        en: 'Notifications',
        bn: 'বিজ্ঞপ্তি'
      }
    },
    // Dashboard translations
    dashboard: {
      donor: {
        en: 'Donor Dashboard',
        bn: 'দাতার ড্যাশবোর্ড'
      },
      volunteer: {
        en: 'Volunteer Dashboard',
        bn: 'স্বেচ্ছাসেবকের ড্যাশবোর্ড'
      },
      ngo: {
        en: 'NGO Dashboard',
        bn: 'এনজিও ড্যাশবোর্ড'
      },
      title: {
        en: 'Make a Donation',
        bn: 'দান করুন'
      },
      subtitle: {
        en: 'Help those in need by donating essential items',
        bn: 'প্রয়োজনীয় জিনিস দান করে অভাবীদের সাহায্য করুন'
      }
    },
    // Donation form translations
    donation: {
      step1: {
        title: {
          en: 'Select Item Category',
          bn: 'পণ্যের ধরন নির্বাচন করুন'
        },
        itemType: {
          en: 'Item Type',
          bn: 'আইটেমের ধরন'
        },
        selectItem: {
          en: 'Select item type...',
          bn: 'আইটেমের ধরন নির্বাচন করুন...'
        },
        food: {
          en: 'Food',
          bn: 'খাদ্য'
        },
        clothing: {
          en: 'Clothing',
          bn: 'কাপড়'
        },
        medicine: {
          en: 'Medicine',
          bn: 'ওষুধ'
        },
        other: {
          en: 'Other',
          bn: 'অন্যান্য'
        },
        description: {
          en: 'Description',
          bn: 'বিবরণ'
        },
        descriptionPlaceholder: {
          en: 'Describe the items you want to donate...',
          bn: 'আপনি যে আইটেমগুলো দান করতে চান তার বিবরণ দিন...'
        },
        quantity: {
          en: 'Quantity',
          bn: 'পরিমাণ'
        },
        quantityPlaceholder: {
          en: 'e.g., 10 kg rice, 5 shirts',
          bn: 'যেমন: ১০ কেজি চাল, ৫টি শার্ট'
        }
      },
      step2: {
        title: {
          en: 'Step 2: Pickup Location',
          bn: 'ধাপ ২: পিকআপের স্থান'
        },
        address: {
          en: 'Pickup Address',
          bn: 'পিকআপের ঠিকানা'
        },
        addressPlaceholder: {
          en: 'Enter your full address...',
          bn: 'আপনার সম্পূর্ণ ঠিকানা লিখুন...'
        },
        phone: {
          en: 'Contact Phone',
          bn: 'যোগাযোগের ফোন'
        },
        phonePlaceholder: {
          en: 'Your phone number',
          bn: 'আপনার ফোন নম্বর'
        },
        availableTime: {
          en: 'Available Time',
          bn: 'সুবিধাজনক সময়'
        },
        timeOptions: {
          morning: {
            en: 'Morning (9 AM - 12 PM)',
            bn: 'সকাল (৯টা - ১২টা)'
          },
          afternoon: {
            en: 'Afternoon (1 PM - 5 PM)',
            bn: 'দুপুর (১টা - ৫টা)'
          },
          evening: {
            en: 'Evening (6 PM - 8 PM)',
            bn: 'সন্ধ্যা (৬টা - ৮টা)'
          }
        }
      },
      buttons: {
        next: {
          en: 'Next Step',
          bn: 'পরবর্তী ধাপ'
        },
        back: {
          en: 'Back',
          bn: 'পিছনে'
        },
        submit: {
          en: 'Submit Donation',
          bn: 'দান জমা দিন'
        },
        submitting: {
          en: 'Submitting...',
          bn: 'জমা দেওয়া হচ্ছে...'
        },
        highRisk: {
          en: 'High Risk - Cannot Submit',
          bn: 'উচ্চ ঝুঁকি - জমা দেওয়া যাবে না'
        },
        submitValidated: {
          en: '✅ Submit Validated Donation',
          bn: '✅ যাচাইকৃত দান জমা দিন'
        }
      },
      validation: {
        aiProcessing: {
          en: '🤖 AI is validating your donation...',
          bn: '🤖 এআই আপনার দানটি যাচাই করছে...'
        },
        aiApproved: {
          en: '✅ AI Validation: Donation approved!',
          bn: '✅ এআই যাচাইকরণ: দান অনুমোদিত!'
        },
        aiMatching: {
          en: '🔍 AI is finding the best match...',
          bn: '🔍 এআই সেরা মিল খুঁজে বের করছে...'
        },
        matchFound: {
          en: '🎯 Perfect match found!',
          bn: '🎯 নিখুঁত মিল পাওয়া গেছে!'
        },
        volunteerAssigning: {
          en: '👥 Assigning volunteer for pickup...',
          bn: '👥 পিকআপের জন্য স্বেচ্ছাসেবক নিয়োগ দেওয়া হচ্ছে...'
        },
        volunteerAssigned: {
          en: '✅ Volunteer assigned successfully!',
          bn: '✅ স্বেচ্ছাসেবক সফলভাবে নিয়োগ দেওয়া হয়েছে!'
        }
      },
      success: {
        submitted: {
          en: 'Your donation has been submitted successfully.',
          bn: 'আপনার দান সফলভাবে জমা দেওয়া হয়েছে।'
        },
        matchesFound: {
          en: 'potential matches found!',
          bn: 'টি সম্ভাব্য ম্যাচ পাওয়া গেছে!'
        },
        autoApproved: {
          en: ' It has been automatically approved and is ready for matching.',
          bn: ' এটি স্বয়ংক্রিয়ভাবে অনুমোদিত হয়েছে এবং ম্যাচিংয়ের জন্য প্রস্তুত।'
        },
        manualReview: {
          en: ' It has been sent for manual review.',
          bn: ' এটি ম্যানুয়াল যাচাইয়ের জন্য পাঠানো হয়েছে।'
        }
      },
      error: {
        submitFailed: {
          en: 'Failed to submit donation. Please try again.',
          bn: 'দান জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
        }
      },
      chatbot: {
        title: {
          en: 'Donate via Chat',
          bn: 'চ্যাট করে দান করুন'
        },
        description: {
          en: 'Chat with our AI assistant to provide your donation details',
          bn: 'AI সহায়কের সাথে চ্যাট করে আপনার দানের তথ্য দিন'
        },
        openButton: {
          en: 'Open Chatbot',
          bn: 'চ্যাটবট খুলুন'
        }
      }
    },
    // Common terms
    common: {
      save: { en: 'Save', bn: 'সংরক্ষণ' },
      cancel: { en: 'Cancel', bn: 'বাতিল' },
      loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
      error: { en: 'Error', bn: 'ত্রুটি' },
      success: { en: 'Success', bn: 'সফল' },
      required: { en: 'Required', bn: 'প্রয়োজনীয়' },
      optional: { en: 'Optional', bn: 'ঐচ্ছিক' }
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};