import React, { useState } from 'react';
import { useTranslation, LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';

interface DeliveryStatus {
  id: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'confirmed';
  timestamp: Date;
  location?: string;
  note?: string;
  photo?: string;
}

// Mock delivery data
const mockDelivery = {
  id: 'DEL-2024-001',
  donorName: 'রেস্টুরেন্ট আল-মদিনা',
  donorNameEn: 'Al-Madina Restaurant',
  recipientName: 'সাভার এনজিও সেন্টার',
  recipientNameEn: 'Savar NGO Center',
  items: ['খাবার ২০ বক্স', 'পানি ১০ বোতল'],
  itemsEn: ['20 Food Boxes', '10 Water Bottles'],
  volunteerName: 'মোহাম্মদ করিম',
  volunteerNameEn: 'Mohammad Karim',
  pickupLocation: 'ঢাকা, ধানমন্ডি ৫ নম্বর',
  pickupLocationEn: 'Dhanmondi 5, Dhaka',
  deliveryLocation: 'সাভার, আশুলিয়া',
  deliveryLocationEn: 'Ashulia, Savar',
  estimatedTime: '৪৫ মিনিট',
  estimatedTimeEn: '45 minutes'
};

const ConfirmationScreen: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [currentStatus, setCurrentStatus] = useState<DeliveryStatus['status']>('delivered');

  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [confirmationNote, setConfirmationNote] = useState('');
  const [rating, setRating] = useState(0);

  const deliverySteps: DeliveryStatus[] = [
    {
      id: '1',
      status: 'pending',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      location: mockDelivery.pickupLocation,
      note: language === 'bn' ? 'দান গ্রহণের অপেক্ষায়' : 'Waiting for donation acceptance'
    },
    {
      id: '2',
      status: 'picked_up',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      location: mockDelivery.pickupLocation,
      note: language === 'bn' ? 'সামগ্রী পিকআপ সম্পন্ন' : 'Items picked up successfully'
    },
    {
      id: '3',
      status: 'in_transit',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      location: language === 'bn' ? 'পথে' : 'On the way',
      note: language === 'bn' ? 'গন্তব্যের পথে' : 'En route to destination'
    },
    {
      id: '4',
      status: 'delivered',
      timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000), // 30 minutes ago
      location: mockDelivery.deliveryLocation,
      note: language === 'bn' ? 'সফলভাবে ডেলিভারি সম্পন্ন' : 'Successfully delivered'
    }
  ];

  const getStatusText = (status: DeliveryStatus['status']) => {
    const statusTexts = {
      pending: { bn: 'অপেক্ষমান', en: 'Pending' },
      picked_up: { bn: 'পিকআপ সম্পন্ন', en: 'Picked Up' },
      in_transit: { bn: 'পথে', en: 'In Transit' },
      delivered: { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
      confirmed: { bn: 'নিশ্চিত', en: 'Confirmed' }
    };
    return statusTexts[status][language];
  };



  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = () => {
    setCurrentStatus('confirmed');
    // Here you would typically send the confirmation to the backend
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                onClick={() => window.history.back()}
                className="text-green-600 hover:text-green-700"
                style={{ color: colors.text.secondary, background: 'none', border: `1px solid ${colors.border.primary}`, cursor: 'pointer', transition: 'color 0.3s ease', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: colors.bg.secondary }}
              >
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 bangla-text tracking-tight"
                  style={{ fontSize: '1.5rem', fontWeight: '900', color: colors.text.primary, letterSpacing: '-0.025em' }}>
                  {language === 'bn' ? 'ডেলিভারি নিশ্চিতকরণ' : 'Delivery Confirmation'}
                </h1>
                <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? `ডেলিভারি ID: ${mockDelivery.id}` : `Delivery ID: ${mockDelivery.id}`}
                </p>
              </div>
            </div>
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Delivery Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8"
          style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 bangla-text"
            style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1rem' }}>
            {language === 'bn' ? 'ডেলিভারি সারসংক্ষেপ' : 'Delivery Summary'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

            {/* From Section */}
            <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex items-center space-x-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="w-3 h-3 bg-blue-500 rounded-full" style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                <span className="text-sm font-semibold text-gray-700" style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text.secondary }}>
                  {language === 'bn' ? 'থেকে' : 'From'}
                </span>
              </div>
              <div className="ml-5" style={{ marginLeft: '1.25rem' }}>
                <h3 className="font-bold text-gray-900 bangla-text" style={{ fontWeight: '700', color: colors.text.primary }}>
                  {language === 'bn' ? mockDelivery.donorName : mockDelivery.donorNameEn}
                </h3>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? mockDelivery.pickupLocation : mockDelivery.pickupLocationEn}
                </p>
                <div className="mt-2 flex flex-wrap gap-1" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {(language === 'bn' ? mockDelivery.items : mockDelivery.itemsEn).map((item, index) => (
                    <span key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', borderRadius: '9999px' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* To Section */}
            <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex items-center space-x-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="w-3 h-3 bg-green-500 rounded-full" style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
                <span className="text-sm font-semibold text-gray-700" style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text.secondary }}>
                  {language === 'bn' ? 'গন্তব্য' : 'To'}
                </span>
              </div>
              <div className="ml-5" style={{ marginLeft: '1.25rem' }}>
                <h3 className="font-bold text-gray-900 bangla-text" style={{ fontWeight: '700', color: colors.text.primary }}>
                  {language === 'bn' ? mockDelivery.recipientName : mockDelivery.recipientNameEn}
                </h3>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? mockDelivery.deliveryLocation : mockDelivery.deliveryLocationEn}
                </p>
                <div className="mt-2 flex items-center space-x-2" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="w-4 h-4 text-gray-500" style={{ width: '1rem', height: '1rem', color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                    {language === 'bn' ? mockDelivery.volunteerName : mockDelivery.volunteerNameEn}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8"
          style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6 bangla-text"
            style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
            {language === 'bn' ? 'ডেলিভারি ট্র্যাকিং' : 'Delivery Tracking'}
          </h2>

          <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {deliverySteps.map((step, index) => {
              const isCompleted = deliverySteps.findIndex(s => s.status === currentStatus) >= index;
              const isCurrent = step.status === currentStatus;

              return (
                <div key={step.id} className="flex items-start space-x-4" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCompleted ? '#22c55e' : '#d1d5db'
                    }}>
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: 'white', borderRadius: '50%' }}></div>
                    )}
                    {index < deliverySteps.length - 1 && (
                      <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-6 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{
                          position: 'absolute',
                          top: '2rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '2px',
                          height: '1.5rem',
                          backgroundColor: isCompleted ? '#22c55e' : '#d1d5db'
                        }}>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 bangla-text"
                        style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text.primary }}>
                        {getStatusText(step.status)}
                      </h3>
                      <span className="text-xs text-gray-500" style={{ fontSize: '0.75rem', color: colors.text.tertiary }}>
                        {formatTime(step.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 bangla-text mb-1"
                      style={{ fontSize: '0.875rem', color: colors.text.secondary, marginBottom: '0.25rem' }}>
                      {step.location}
                    </p>
                    <p className="text-xs text-gray-500 bangla-text"
                      style={{ fontSize: '0.75rem', color: colors.text.tertiary }}>
                      {step.note}
                    </p>
                    {isCurrent && currentStatus === 'delivered' && (
                      <div className="mt-3" style={{ marginTop: '0.75rem' }}>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: colors.green.bg,
                            color: colors.green.primary,
                            border: `1px solid ${colors.green.border}`
                          }}>
                          {language === 'bn' ? '✅ নিশ্চিতকরণের অপেক্ষায়' : '✅ Awaiting Confirmation'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmation Section */}
        {currentStatus === 'delivered' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 bangla-text"
              style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1rem' }}>
              {language === 'bn' ? 'ডেলিভারি নিশ্চিত করুন' : 'Confirm Delivery'}
            </h2>

            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 bangla-text"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                  {language === 'bn' ? 'ডেলিভারির ছবি আপলোড করুন' : 'Upload Delivery Photo'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors"
                  style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'center', padding: '1.25rem 1.5rem', border: `2px dashed ${colors.border.primary}`, borderRadius: '0.5rem', transition: 'border-color 0.3s ease' }}>
                  <div className="space-y-1 text-center">
                    {uploadedPhoto ? (
                      <div className="relative">
                        <img src={uploadedPhoto} alt="Delivery proof"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                          style={{ margin: '0 auto', height: '8rem', width: '8rem', objectFit: 'cover', borderRadius: '0.5rem' }} />
                        <button
                          onClick={() => setUploadedPhoto(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400"
                          style={{ margin: '0 auto', height: '3rem', width: '3rem', color: colors.text.tertiary }}
                          stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600" style={{ display: 'flex', fontSize: '0.875rem', color: colors.text.secondary }}>
                          <label htmlFor="photo-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                            style={{ position: 'relative', cursor: 'pointer', backgroundColor: colors.bg.secondary, borderRadius: '0.375rem', fontWeight: '500', color: colors.green.primary }}>
                            <span className="bangla-text">
                              {language === 'bn' ? 'একটি ফাইল আপলোড করুন' : 'Upload a file'}
                            </span>
                            <input id="photo-upload" name="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                          </label>
                          <p className="pl-1 bangla-text" style={{ paddingLeft: '0.25rem' }}>
                            {language === 'bn' ? 'অথবা টেনে আনুন' : 'or drag and drop'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 bangla-text"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.75rem' }}>
                  {language === 'bn' ? 'সেবার মান রেটিং দিন' : 'Rate the Service'}
                </label>
                <div className="flex items-center space-x-1" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        color: rating >= star ? '#fbbf24' : '#d1d5db',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600" style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: colors.text.secondary }}>
                    {rating > 0 && `${rating}/5`}
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 bangla-text"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                  {language === 'bn' ? 'অতিরিক্ত মন্তব্য (ঐচ্ছিক)' : 'Additional Comments (Optional)'}
                </label>
                <textarea
                  value={confirmationNote}
                  onChange={(e) => setConfirmationNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                  placeholder={language === 'bn' ? 'আপনার মন্তব্য লিখুন...' : 'Write your comments...'}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '0.5rem',
                    outline: 'none',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    backgroundColor: colors.bg.secondary,
                    color: colors.text.primary
                  }}
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmDelivery}
                disabled={!uploadedPhoto}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                style={{
                  width: '100%',
                  backgroundColor: uploadedPhoto ? colors.green.primary : '#9ca3af',
                  color: uploadedPhoto ? 'white' : '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: uploadedPhoto ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: colors.shadow
                }}
              >
                {language === 'bn' ? 'ডেলিভারি নিশ্চিত করুন' : 'Confirm Delivery'}
              </button>

              {!uploadedPhoto && (
                <p className="text-sm text-red-600 text-center bangla-text"
                  style={{ fontSize: '0.875rem', color: '#dc2626', textAlign: 'center' }}>
                  {language === 'bn' ? 'নিশ্চিতকরণের জন্য একটি ছবি আপলোড করুন' : 'Please upload a photo to confirm delivery'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {currentStatus === 'confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
            style={{ backgroundColor: colors.green.bg, border: `1px solid ${colors.green.border}`, borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ width: '4rem', height: '4rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <svg className="w-8 h-8 text-green-600" style={{ width: '2rem', height: '2rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2 bangla-text"
              style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.green.primary, marginBottom: '0.5rem' }}>
              {language === 'bn' ? 'ডেলিভারি সফলভাবে নিশ্চিত হয়েছে!' : 'Delivery Successfully Confirmed!'}
            </h3>
            <p className="text-green-700 bangla-text" style={{ color: colors.green.primary }}>
              {language === 'bn'
                ? 'আপনার মূল্যবান অবদানের জন্য ধন্যবাদ। এই তথ্যগুলি আমাদের সিস্টেমে সংরক্ষিত হয়েছে।'
                : 'Thank you for your valuable contribution. This information has been saved in our system.'}
            </p>
            <div className="mt-4 flex justify-center space-x-4" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors bangla-text"
                style={{ padding: '0.5rem 1.5rem', backgroundColor: colors.green.primary, color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                {language === 'bn' ? 'নতুন ডেলিভারি' : 'New Delivery'}
              </button>
              <button className="px-6 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors bangla-text"
                style={{ padding: '0.5rem 1.5rem', backgroundColor: colors.bg.tertiary, color: colors.green.primary, border: `1px solid ${colors.green.primary}`, borderRadius: '0.5rem', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                {language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationScreen;