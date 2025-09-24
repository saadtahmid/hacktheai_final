import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import { Header } from '../components';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../services/aiService';

import type { ValidationResult } from '../services/aiService';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const containerVariants = {
  initial: { opacity: 0 },
  in: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  in: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    quantity: '',
    unit: '',
    description: '',
    urgency: 'medium',
    location: '',
    expiryDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for AI matching
  const [isMatching, setIsMatching] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);

  // Get current location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Use default Dhaka coordinates
          setCurrentLocation({
            lat: 23.8103,
            lng: 90.4125
          });
        }
      );
    }
  }, []);

  const categories = [
    { id: 'food', label: { bn: 'খাদ্য', en: 'Food' }, icon: '🍚' },
    { id: 'clothes', label: { bn: 'পোশাক', en: 'Clothes' }, icon: '👕' },
    { id: 'medicine', label: { bn: 'ওষুধ', en: 'Medicine' }, icon: '💊' },
    { id: 'blankets', label: { bn: 'কম্বল', en: 'Blankets' }, icon: '🛏️' },
    { id: 'other', label: { bn: 'অন্যান্য', en: 'Other' }, icon: '📦' },
  ];

  const urgencyLevels = [
    { id: 'low', label: { bn: 'কম জরুরি', en: 'Low' }, color: '#22c55e' },
    { id: 'medium', label: { bn: 'মাঝারি', en: 'Medium' }, color: '#f59e0b' },
    { id: 'high', label: { bn: 'জরুরি', en: 'High' }, color: '#ef4444' },
  ];

  // Real-time validation function
  const validateDonation = async () => {
    if (!formData.name || !formData.category || !formData.quantity || !formData.location) {
      return; // Don't validate incomplete forms
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await aiService.validateSubmission({
        type: 'donation',
        content: {
          itemName: formData.name,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          description: formData.description,
          urgency: formData.urgency,
          location: formData.location,
          contactInfo: user?.phone || user?.email || 'Not provided'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userType: 'donor',
          previousSubmissions: 0
        }
      });

      if (response.data) {
        setValidationResult(response.data);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError(
        language === 'bn'
          ? 'যাচাইকরণ সেবা বর্তমানে অনুপলব্ধ'
          : 'Validation service temporarily unavailable'
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Trigger validation when form data changes (debounced)
  React.useEffect(() => {
    const timer = setTimeout(validateDonation, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [formData.name, formData.category, formData.quantity, formData.location, formData.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!user) {
        setError(language === 'bn' ? 'লগইন করুন' : 'Please login first');
        setIsSubmitting(false);
        return;
      }

      // Check validation results
      if (validationResult && !validationResult.isValid && validationResult.riskLevel === 'high') {
        setError(
          language === 'bn'
            ? 'উচ্চ ঝুঁকির কারণে এই দান জমা দেওয়া যাচ্ছে না। দয়া করে তথ্য সংশোধন করুন।'
            : 'Cannot submit donation due to high risk level. Please correct the information.'
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare donation data for API
      const donationData = {
        donor_id: user.id,
        item_name: formData.name,
        category: formData.category as 'food' | 'clothes' | 'medicine' | 'blankets' | 'water' | 'hygiene' | 'other',
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        description: formData.description || undefined,
        urgency: formData.urgency as 'low' | 'medium' | 'high' | 'critical',
        pickup_address: formData.location,
        pickup_coordinates: currentLocation || { lat: 23.8103, lng: 90.4125 },
        expiry_date: formData.expiryDate || undefined,
        images: [], // TODO: Implement image upload
        validation_result: validationResult || undefined
      };

      // Call API to create donation
      const response = await apiService.createDonation(donationData);

      if (response.success) {
        console.log('Donation submitted successfully:', response.data);

        // If auto-approved, try to find matches
        let matches = null;
        if (validationResult?.autoApprove) {
          try {
            setIsMatching(true);
            setMatchingError(null);

            // Prepare matching data
            const matchingPayload = {
              triggerType: 'newDonation' as const,
              primaryItem: {
                id: response.data.id,
                type: "donation" as const,
                itemName: formData.name,
                category: formData.category,
                quantity: parseFloat(formData.quantity),
                urgency: formData.urgency,
                location: {
                  address: formData.location,
                  coordinates: currentLocation || { lat: 23.8103, lng: 90.4125 },
                  district: "Dhaka", // TODO: Extract from location
                  division: "Dhaka"
                },
                expiryDate: formData.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
              },
              constraints: {
                maxDistance: 15,
                urgencyWeight: 0.7,
                categoryStrict: true,
                quantityTolerance: 0.3
              }
            };

            console.log('🔍 Finding matches for donation:', matchingPayload);
            matches = await aiService.findMatches(matchingPayload);

            console.log('✅ Matches found:', matches);

            // If matches found, create actual match records in database
            if (matches && matches.success && matches.data && matches.data.matches && matches.data.matches.length > 0) {
              try {
                console.log('💾 Creating match records in database...');
                const bestMatch = matches.data.matches[0];

                // Create the match record in database using the best AI suggestion
                const matchCreationResult = await apiService.createMatch({
                  donation_id: response.data.id,
                  request_id: bestMatch.id, // This should be the request ID from AI matching
                  matching_score: bestMatch.score,
                  ai_reasoning: bestMatch.reason || 'AI-powered matching based on category, location, and urgency'
                });

                if (matchCreationResult.success) {
                  console.log('✅ Match record created:', matchCreationResult.data);

                  // Update the match ID to use the database-created match
                  const databaseMatchId = matchCreationResult.data.id;
                  console.log('🤖 Assigning volunteer using AI routing for database match:', databaseMatchId);

                  // Get delivery location from the matched request or use estimated location
                  const deliveryLocation = {
                    lat: 23.7925 + (Math.random() - 0.5) * 0.02, // Small random offset near Dhaka
                    lng: 90.4078 + (Math.random() - 0.5) * 0.02,
                    address: `Dhaka`
                  };

                  const routingResult = await aiService.assignVolunteer({
                    matchId: databaseMatchId,
                    donationLocation: {
                      lat: currentLocation?.lat || 23.8103,
                      lng: currentLocation?.lng || 90.4125,
                      address: formData.location
                    },
                    deliveryLocation: deliveryLocation,
                    itemDetails: {
                      category: formData.category,
                      quantity: parseFloat(formData.quantity),
                      urgency: formData.urgency,
                      weight: formData.category === 'water' ? parseFloat(formData.quantity) * 1.5 :
                        formData.category === 'food' ? parseFloat(formData.quantity) :
                          parseFloat(formData.quantity) * 0.5 // Estimate weight
                    },
                    constraints: {
                      maxDistance: 25,
                      vehicleType: 'motorcycle'
                    }
                  });

                  console.log('✅ AI Volunteer assignment completed:', routingResult);

                  // Create delivery record after successful volunteer assignment
                  if (routingResult.success && routingResult.data?.assignedVolunteer?.id) {
                    try {
                      const deliveryCreationResult = await apiService.createDelivery({
                        match_id: matchCreationResult.data.id,
                        volunteer_id: routingResult.data.assignedVolunteer.id,
                        pickup_location: formData.location,
                        pickup_coordinates: {
                          lat: currentLocation?.lat || 23.8103,
                          lng: currentLocation?.lng || 90.4125
                        },
                        delivery_location: deliveryLocation.address,
                        delivery_coordinates: deliveryLocation,
                        scheduled_pickup: routingResult.data.simpleRoute?.pickup?.eta,
                        scheduled_delivery: routingResult.data.simpleRoute?.delivery?.eta,
                        special_instructions: `AI Assignment: ${routingResult.data.assignedVolunteer.aiReasoning || 'Optimally matched volunteer'}`
                      });

                      if (deliveryCreationResult.success) {
                        console.log('📦 Delivery record created:', deliveryCreationResult.data);

                        // Update the match with volunteer assignment
                        try {
                          await apiService.updateMatchVolunteer(matchCreationResult.data.id, routingResult.data.assignedVolunteer.id);
                          console.log('🤝 Match updated with volunteer assignment');
                        } catch (updateError) {
                          console.warn('⚠️ Could not update match with volunteer, but delivery was created:', updateError);
                        }
                      } else {
                        console.error('❌ Failed to create delivery record:', deliveryCreationResult.error);
                      }
                    } catch (deliveryError) {
                      console.error('❌ Error creating delivery record:', deliveryError);
                    }
                  }

                  // Add AI routing results to matches for display
                  if (routingResult.success) {
                    (matches as any).routingResult = {
                      ...routingResult.data,
                      aiPowered: true,
                      timestamp: new Date().toISOString()
                    };
                  }
                } else {
                  console.error('❌ Failed to create match record:', matchCreationResult.error);
                }

              } catch (routingError) {
                console.warn('⚠️ AI Volunteer assignment failed:', routingError);
                // Don't fail the whole process if AI routing fails
              }
            }
          } catch (matchError) {
            console.warn('⚠️ Matching failed but donation was submitted:', matchError);
            setMatchingError(matchError instanceof Error ? matchError.message : 'Matching failed');
          } finally {
            setIsMatching(false);
          }
        }

        let message = t('donation.success.submitted');

        if (validationResult?.autoApprove) {
          if (matches && matches.success && matches.data && matches.data.totalMatches > 0) {
            message += language === 'bn'
              ? ` ${matches.data.totalMatches}টি সম্ভাব্য ম্যাচ পাওয়া গেছে!`
              : ` ${matches.data.totalMatches} potential matches found!`;
          } else {
            message += language === 'bn'
              ? ' এটি স্বয়ংক্রিয়ভাবে অনুমোদিত হয়েছে এবং ম্যাচিংয়ের জন্য প্রস্তুত।'
              : ' It has been automatically approved and is ready for matching.';
          }
        } else {
          message += language === 'bn'
            ? ' এটি ম্যানুয়াল যাচাইয়ের জন্য পাঠানো হয়েছে।'
            : ' It has been sent for manual verification.';
        }

        navigate('/confirmation', {
          state: {
            type: 'donation',
            data: response.data,
            message,
            validationResult,
            matchingResults: matches,
            matchingError: matchingError
          }
        });
      } else {
        throw new Error(response.error || 'Failed to submit donation');
      }
    } catch (err: any) {
      console.error('Error submitting donation:', err);
      setError(t('donation.error.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId });
  };

  return (
    <motion.div
      className="min-h-screen"
      style={{ minHeight: '100vh', background: colors.bg.gradient }}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
    >

      {/* Header Component */}
      <Header title={t('dashboard.donor')} />

      <motion.main
        className="min-h-screen"
        style={{ minHeight: '100vh', background: colors.bg.gradient }}
        variants={containerVariants}
      >
        <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1rem' }}
          variants={itemVariants}
        >

          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            style={{ textAlign: 'center', marginBottom: '4rem' }}
            variants={itemVariants}
          >
            <motion.h1
              className="text-5xl font-black mb-6 bangla-text leading-tight"
              style={{ fontSize: '3rem', fontWeight: '900', color: colors.text.primary, marginBottom: '1.5rem', lineHeight: '1.1' }}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {t('dashboard.title')}
            </motion.h1>
            <motion.p
              className="text-2xl max-w-4xl mx-auto bangla-text font-medium leading-relaxed"
              style={{ fontSize: '1.5rem', color: colors.text.secondary, maxWidth: '56rem', margin: '0 auto', fontWeight: '500', lineHeight: '1.6' }}
              variants={itemVariants}
            >
              {t('dashboard.subtitle')}
            </motion.p>
          </motion.div>

          {/* Main Form Container */}
          <motion.div
            className="rounded-xl shadow-lg p-8 mb-8"
            style={{
              backgroundColor: colors.bg.tertiary,
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: colors.shadow,
              marginBottom: '2rem'
            }}
            variants={cardVariants}
            whileHover="hover"
            initial="initial"
            animate="in"
          >

            <form onSubmit={handleSubmit}>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 rounded-lg" style={{
                  backgroundColor: `rgba(239, 68, 68, 0.1)`,
                  border: `1px solid rgba(239, 68, 68, 0.2)`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="bangla-text font-medium" style={{ color: '#dc2626' }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Validation Loading */}
              {isValidating && (
                <div className="mb-6 p-4 rounded-lg" style={{
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  border: `1px solid rgba(59, 130, 246, 0.2)`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
                    <p className="bangla-text font-medium" style={{ color: '#2563eb' }}>
                      {t('donation.validation.aiProcessing')}
                    </p>
                  </div>
                </div>
              )}

              {validationResult && !isValidating && (
                <div className={`mx-6 mb-6 rounded-xl p-6 ${validationResult.isValid
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                  : 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20'
                  }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {validationResult.isValid ? (
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold bangla-text ${validationResult.isValid
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-orange-800 dark:text-orange-200'
                          }`}>
                          {validationResult.isValid
                            ? (language === 'bn' ? '✅ যাচাইকরণ সফল হয়েছে' : '✅ Validation Successful')
                            : (language === 'bn' ? '⚠️ যাচাইকরণে কিছু সমস্যা পাওয়া গেছে' : '⚠️ Validation Issues Found')
                          }
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${validationResult.isValid
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                          {language === 'bn' ? 'বিশ্বস্ততা' : 'Confidence'}: {Math.round(validationResult.confidence * 100)}%
                        </span>
                      </div>

                      {validationResult.issues && validationResult.issues.length > 0 && (
                        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 bangla-text mb-2">
                            {language === 'bn' ? 'সমস্যাসমূহ:' : 'Issues:'}
                          </h4>
                          <ul className="space-y-2">
                            {validationResult.issues.map((issue, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300 bangla-text">
                                <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 bangla-text mb-2">
                            {language === 'bn' ? 'পরামর্শ:' : 'Suggestions:'}
                          </h4>
                          <ul className="space-y-2">
                            {validationResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300 bangla-text">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4 flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 bangla-text">
                          {language === 'bn' ? 'ঝুঁকির স্তর' : 'Risk Level'}:
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${validationResult.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          validationResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {validationResult.riskLevel?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {validationError && (
                <div className="mx-6 mb-6 rounded-xl p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 bangla-text">
                        {language === 'bn' ? 'যাচাইকরণ ত্রুটি' : 'Validation Error'}
                      </h3>
                      <p className="text-red-700 dark:text-red-300 bangla-text text-sm mt-1">
                        {validationError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Selection */}
              <div className="p-8">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold bangla-text mb-4" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: colors.text.primary }}>
                    {t('donation.step1.title')}
                  </h2>
                  <p className="bangla-text" style={{ color: colors.text.secondary, fontSize: '1rem' }}>
                    {language === 'bn' ? '✨ আপনার দানের জন্য উপযুক্ত বিভাগ নির্বাচন করুন' : '✨ Select the appropriate category for your donation'}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-6 max-w-5xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', maxWidth: '80rem', margin: '0 auto' }}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      className="rounded-xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl group"
                      style={{
                        backgroundColor: formData.category === category.id ? colors.green.bg : colors.bg.tertiary,
                        border: formData.category === category.id ? `2px solid ${colors.green.primary}` : `2px solid transparent`,
                        borderRadius: '0.75rem',
                        boxShadow: colors.shadow,
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: formData.category === category.id ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
                        style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <div className="text-3xl" style={{ fontSize: '1.875rem' }}>
                          {category.icon}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold bangla-text" style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: formData.category === category.id ? colors.green.primary : colors.text.primary
                      }}>
                        {category.label[language]}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Details */}
              {formData.category && (
                <div className="rounded-xl shadow-lg p-6"
                  style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
                  <h3 className="text-xl font-bold mb-6 bangla-text"
                    style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
                    {language === 'bn' ? 'পণ্যের বিবরণ' : 'Item Details'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'পণ্যের নাম' : 'Item Name'} *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === 'bn' ? 'যেমন: ভাত, রুটি, শাক-সবজি' : 'e.g., Rice, Bread, Vegetables'}
                        required
                        className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text"
                          style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                          {t('donation.step1.quantity')} *
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="০"
                          required
                          className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: colors.bg.primary,
                            color: colors.text.primary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text"
                          style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                          {language === 'bn' ? 'একক' : 'Unit'} *
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          placeholder={language === 'bn' ? 'কেজি/লিটার/টুকরা' : 'kg/L/pieces'}
                          required
                          className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: colors.bg.primary,
                            color: colors.text.primary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={language === 'bn' ? 'অতিরিক্ত তথ্য...' : 'Additional details...'}
                        rows={3}
                        className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {formData.category === 'food' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text"
                          style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                          {language === 'bn' ? 'মেয়াদ উত্তীর্ণের তারিখ' : 'Expiry Date'}
                        </label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: colors.bg.primary,
                            color: colors.text.primary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Urgency and Location */}
              {formData.category && (
                <div className="rounded-xl shadow-lg p-6"
                  style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
                  <h3 className="text-xl font-bold mb-6 bangla-text"
                    style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
                    {language === 'bn' ? 'জরুরি অবস্থা ও স্থান' : 'Urgency & Location'}
                  </h3>
                  <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label className="block text-sm font-medium mb-3 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.75rem' }}>
                        {language === 'bn' ? 'জরুরি অবস্থা' : 'Urgency Level'}
                      </label>
                      <div className="grid grid-cols-3 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        {urgencyLevels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, urgency: level.id })}
                            className="p-3 rounded-lg border-2 transition-all"
                            style={{
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              border: formData.urgency === level.id ? `2px solid ${level.color}` : `2px solid ${colors.border.primary}`,
                              backgroundColor: formData.urgency === level.id ? `${level.color}20` : colors.bg.secondary,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div className="w-3 h-3 rounded-full mx-auto mb-2"
                              style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: level.color, margin: '0 auto 0.5rem auto' }}></div>
                            <div className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.primary }}>
                              {level.label[language]}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'পিকআপের ঠিকানা' : 'Pickup Address'} *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ ঠিকানা লিখুন' : 'Enter your complete address'}
                        required
                        className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {formData.category && (
                <div className="flex justify-center mt-8" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isMatching ||
                      !formData.name ||
                      !formData.quantity ||
                      !formData.location ||
                      isValidating ||
                      (validationResult?.riskLevel === 'high') || false
                    }
                    className="w-full max-w-md font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bangla-text"
                    style={{
                      width: '100%',
                      maxWidth: '28rem',
                      backgroundColor: (
                        isSubmitting ||
                        isMatching ||
                        !formData.name ||
                        !formData.quantity ||
                        !formData.location ||
                        isValidating ||
                        (validationResult && validationResult.riskLevel === 'high')
                      ) ? (isDark ? '#374151' : '#9ca3af') : '#16a34a',
                      color: '#ffffff',
                      fontWeight: '700',
                      padding: '1rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: (
                        isSubmitting ||
                        isMatching ||
                        !formData.name ||
                        !formData.quantity ||
                        !formData.location ||
                        isValidating ||
                        (validationResult && validationResult.riskLevel === 'high')
                      ) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: colors.shadow,
                      opacity: '1'
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('donation.buttons.submitting')}
                      </span>
                    ) : isMatching ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('donation.validation.aiMatching')}
                      </span>
                    ) : isValidating ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('donation.validation.aiProcessing')}
                      </span>
                    ) : validationResult && validationResult.riskLevel === 'high' ? (
                      t('donation.buttons.highRisk')
                    ) : validationResult && validationResult.isValid ? (
                      t('donation.buttons.submitValidated')
                    ) : (
                      t('donation.buttons.submit')
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>

          {/* Chat Input Option */}
          <motion.div
            className="text-center rounded-xl shadow-lg p-8 mt-8"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '2rem', margin: '2rem 0 0 0', textAlign: 'center' }}
            variants={cardVariants}
            whileHover="hover"
            initial="initial"
            animate="in"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <svg className="w-8 h-8" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold mb-3 bangla-text" style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '0.75rem' }}>
              {t('donation.chatbot.title')}
            </h3>

            <p className="mb-6 bangla-text leading-relaxed" style={{ color: colors.text.secondary, fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {t('donation.chatbot.description')}
            </p>

            <button
              onClick={() => navigate('/chatbot', { state: { mode: 'donor' } })}
              className="w-full max-w-sm font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bangla-text"
              style={{
                width: '100%',
                maxWidth: '24rem',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: '700',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: colors.shadow
              }}
            >
              {t('donation.chatbot.openButton')}
            </button>
          </motion.div>
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default DonorDashboard;