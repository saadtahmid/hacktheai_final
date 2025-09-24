import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../services/aiService';

import type { ValidationResult } from '../services/aiService';

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();
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

        let message = language === 'bn'
          ? 'আপনার দান সফলভাবে জমা দেওয়া হয়েছে।'
          : 'Your donation has been submitted successfully.';

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
      setError(
        language === 'bn'
          ? 'দান জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to submit donation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId });
  };

  return (
    <div className="min-h-screen"
      style={{ minHeight: '100vh', background: colors.bg.gradient }}>

      {/* Header */}
      <header className="shadow-lg border-b-2"
        style={{ backgroundColor: colors.bg.primary, boxShadow: colors.shadow, borderBottom: `2px solid ${colors.border.accent}` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem' }}>
          <div className="flex justify-between items-center"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/')}
                className="text-green-600 hover:text-green-700"
                style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.3s ease' }}
              >
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-black bangla-text tracking-tight"
                style={{ fontSize: '1.5rem', fontWeight: '900', color: colors.text.primary, letterSpacing: '-0.025em' }}>
                {language === 'bn' ? 'দাতার ড্যাশবোর্ড' : 'Donor Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* User info */}
              {user && (
                <span className="bangla-text font-medium" style={{ color: colors.text.primary, fontWeight: '500' }}>
                  {language === 'bn' ? 'স্বাগতম, ' : 'Welcome, '}{user.full_name}
                </span>
              )}

              {/* Logout button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
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

              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>

        <div className="mb-8" style={{ marginBottom: '2rem' }}>
          <h2 className="text-3xl font-black mb-2 bangla-text tracking-tight"
            style={{ fontSize: '1.875rem', fontWeight: '900', color: colors.text.primary, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            {language === 'bn' ? 'একটি পণ্য দান করুন' : 'Donate an Item'}
          </h2>
          <p className="bangla-text text-lg" style={{ color: colors.text.secondary, fontSize: '1.125rem' }}>
            {language === 'bn'
              ? 'আপনার উদ্বৃত্ত সামগ্রী দুর্গত এলাকায় পৌঁছে দিতে সাহায্য করুন'
              : 'Help deliver your surplus items to affected areas'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg p-4 border-l-4"
              style={{
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                color: '#dc2626'
              }}>
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium bangla-text">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Validation Feedback */}
          {isValidating && (
            <div className="rounded-lg p-4 border-l-4"
              style={{
                backgroundColor: '#f0f9ff',
                borderLeft: '4px solid #0ea5e9',
                color: '#0369a1'
              }}>
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-sm font-medium bangla-text">
                  {language === 'bn' ? 'AI যাচাইকরণ চলছে...' : 'AI validation in progress...'}
                </p>
              </div>
            </div>
          )}

          {validationResult && !isValidating && (
            <div className={`rounded-lg p-4 border-l-4 ${validationResult.isValid
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-orange-50 border-orange-400 text-orange-800'
              }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {validationResult.isValid ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium bangla-text">
                    {validationResult.isValid
                      ? (language === 'bn' ? '✅ যাচাইকরণ সফল হয়েছে' : '✅ Validation Successful')
                      : (language === 'bn' ? '⚠️ যাচাইকরণে কিছু সমস্যা পাওয়া গেছে' : '⚠️ Validation Issues Found')
                    }
                    <span className="ml-2 text-xs opacity-75">
                      ({language === 'bn' ? 'বিশ্বস্ততা' : 'Confidence'}: {Math.round(validationResult.confidence * 100)}%)
                    </span>
                  </p>

                  {validationResult.issues && validationResult.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium bangla-text">
                        {language === 'bn' ? 'সমস্যাসমূহ:' : 'Issues:'}
                      </p>
                      <ul className="mt-1 text-sm list-disc list-inside bangla-text">
                        {validationResult.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium bangla-text">
                        {language === 'bn' ? 'পরামর্শ:' : 'Suggestions:'}
                      </p>
                      <ul className="mt-1 text-sm list-disc list-inside bangla-text">
                        {validationResult.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 text-xs opacity-75 bangla-text">
                    {language === 'bn' ? 'ঝুঁকির স্তর' : 'Risk Level'}:
                    <span className={`ml-1 px-2 py-1 rounded text-white ${validationResult.riskLevel === 'low' ? 'bg-green-500' :
                      validationResult.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                      {validationResult.riskLevel?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {validationError && (
            <div className="rounded-lg p-4 border-l-4"
              style={{
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                color: '#dc2626'
              }}>
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium bangla-text">
                    {validationError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
            <h3 className="text-xl font-bold mb-6 bangla-text"
              style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
              {language === 'bn' ? 'পণ্যের ধরন নির্বাচন করুন' : 'Select Item Category'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${formData.category === category.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                    }`}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: formData.category === category.id ? '2px solid #22c55e' : `2px solid ${colors.border.primary}`,
                    backgroundColor: formData.category === category.id ? colors.green.bg : colors.bg.secondary,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div className="text-3xl mb-2" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                  <div className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.primary }}>
                    {category.label[language]}
                  </div>
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

                <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="block text-sm font-medium mb-2 bangla-text"
                      style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                      {language === 'bn' ? 'পরিমাণ' : 'Quantity'} *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="০"
                      required
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
            <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
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
                className="px-8 py-3 text-lg font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  borderRadius: '0.75rem',
                  backgroundColor: (
                    isSubmitting ||
                    isMatching ||
                    !formData.name ||
                    !formData.quantity ||
                    !formData.location ||
                    isValidating ||
                    (validationResult && validationResult.riskLevel === 'high')
                  ) ? '#d1d5db' :
                    validationResult && validationResult.isValid ? '#16a34a' : '#f59e0b',
                  color: 'white',
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
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isSubmitting ? (
                  language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'
                ) : isMatching ? (
                  language === 'bn' ? '🔍 ম্যাচ খোঁজা হচ্ছে...' : '🔍 Finding Matches...'
                ) : isValidating ? (
                  language === 'bn' ? 'যাচাইকরণ...' : 'Validating...'
                ) : validationResult && validationResult.riskLevel === 'high' ? (
                  language === 'bn' ? 'উচ্চ ঝুঁকি - জমা দেওয়া যাবে না' : 'High Risk - Cannot Submit'
                ) : validationResult && validationResult.isValid ? (
                  language === 'bn' ? '✅ যাচাইকৃত দান জমা দিন' : '✅ Submit Validated Donation'
                ) : (
                  language === 'bn' ? 'দান করুন' : 'Submit Donation'
                )}
              </button>
            </div>
          )}
        </form>

        {/* Chat Input Option */}
        <div className="mt-8 rounded-xl p-6"
          style={{ marginTop: '2rem', backgroundColor: colors.green.bg, border: `1px solid ${colors.green.border}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div className="text-center" style={{ textAlign: 'center' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ width: '3rem', height: '3rem', backgroundColor: colors.green.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bangla-text"
              style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.text.primary }}>
              {language === 'bn' ? 'চ্যাট করে দান করুন' : 'Donate via Chat'}
            </h3>
            <p className="mb-4 bangla-text" style={{ color: colors.green.primary, marginBottom: '1rem' }}>
              {language === 'bn'
                ? 'AI সহায়কের সাথে চ্যাট করে আপনার দানের তথ্য দিন'
                : 'Chat with our AI assistant to provide your donation details'}
            </p>
            <button
              onClick={() => navigate('/chatbot', { state: { mode: 'donor' } })}
              className="px-6 py-2 border rounded-lg transition-colors bangla-text"
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: colors.bg.primary,
                color: colors.green.primary,
                border: `1px solid ${colors.green.primary}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.green.bg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bg.primary}
            >
              {language === 'bn' ? 'চ্যাটবট খুলুন' : 'Open Chatbot'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;