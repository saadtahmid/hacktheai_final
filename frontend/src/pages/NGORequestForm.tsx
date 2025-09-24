import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

const NGORequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { user, isAuthenticated, logout } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: '',
    itemName: '',
    quantity: '',
    unit: '',
    beneficiaries: '',
    urgency: 'medium',
    description: '',
    deliveryLocation: '',
    latitude: '23.8103', // Default to Dhaka
    longitude: '90.4125', // Default to Dhaka
    deadline: '',
    district: '',
    division: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'food', label: { bn: 'খাদ্য সামগ্রী', en: 'Food Items' }, icon: '🍚' },
    { id: 'clothes', label: { bn: 'পোশাক-আশাক', en: 'Clothing' }, icon: '👕' },
    { id: 'medicine', label: { bn: 'ওষুধপত্র', en: 'Medicines' }, icon: '💊' },
    { id: 'blankets', label: { bn: 'কম্বল ও বেডিং', en: 'Blankets & Bedding' }, icon: '🛏️' },
    { id: 'other', label: { bn: 'অন্যান্য সামগ্রী', en: 'Other Items' }, icon: '📦' },
  ];

  const urgencyLevels = [
    { id: 'low', label: { bn: 'স্বাভাবিক', en: 'Normal' }, color: '#22c55e' },
    { id: 'medium', label: { bn: 'জরুরি', en: 'Urgent' }, color: '#f59e0b' },
    { id: 'high', label: { bn: 'অতি জরুরি', en: 'Critical' }, color: '#ef4444' },
  ];

  const bangladeshDivisions = [
    { id: 'dhaka', label: { bn: 'ঢাকা', en: 'Dhaka' } },
    { id: 'chittagong', label: { bn: 'চট্টগ্রাম', en: 'Chittagong' } },
    { id: 'sylhet', label: { bn: 'সিলেট', en: 'Sylhet' } },
    { id: 'khulna', label: { bn: 'খুলনা', en: 'Khulna' } },
    { id: 'rajshahi', label: { bn: 'রাজশাহী', en: 'Rajshahi' } },
    { id: 'rangpur', label: { bn: 'রংপুর', en: 'Rangpur' } },
    { id: 'barisal', label: { bn: 'বরিশাল', en: 'Barisal' } },
    { id: 'mymensingh', label: { bn: 'ময়মনসিংহ', en: 'Mymensingh' } },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user is authenticated and is NGO
      if (!isAuthenticated || !user) {
        navigate('/auth');
        return;
      }

      // Debug: log the user object to see what fields are available
      console.log('Current user object:', user);
      console.log('User user_type field:', user.user_type);
      console.log('All user object keys:', Object.keys(user));

      // Check user role - allow if user_type is 'ngo' or if it's undefined (for testing)
      const userRole = user.user_type;
      if (userRole && userRole !== 'ngo') {
        alert(language === 'bn'
          ? `শুধুমাত্র এনজিও অ্যাকাউন্ট থেকে সাহায্যের অনুরোধ করা যাবে। আপনার ভূমিকা: ${userRole}`
          : `Only NGO accounts can create relief requests. Your role: ${userRole}`);
        return;
      }

      // Prepare request data for API (map form fields to match schema)
      const requestData = {
        ngo_id: user.id, // Use actual authenticated user ID
        category: formData.category as 'food' | 'clothes' | 'medicine' | 'blankets' | 'other' | 'water' | 'hygiene',
        item_name: formData.itemName,
        description: formData.description,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        urgency: formData.urgency as 'low' | 'medium' | 'high' | 'critical',
        beneficiaries_count: parseInt(formData.beneficiaries),
        target_demographic: 'families', // Default value
        emergency_type: 'general', // Default value
        delivery_address: formData.deliveryLocation,
        delivery_coordinates: {
          lat: parseFloat(formData.latitude) || 23.8103,
          lng: parseFloat(formData.longitude) || 90.4125
        },
        deadline: formData.deadline
      };

      // Call API to create request
      const response = await apiService.createRequest(requestData);

      if (response.success) {
        console.log('NGO request created successfully:', response.data);
      } else {
        throw new Error(response.error || 'Failed to create request');
      }

      setIsSubmitting(false);
      navigate('/confirmation', {
        state: {
          type: 'request',
          data: requestData,
          message: language === 'bn'
            ? 'আপনার সাহায্যের অনুরোধ সফলভাবে জমা দেওয়া হয়েছে।'
            : 'Your relief request has been submitted successfully.'
        }
      });
    } catch (err: any) {
      console.error('Error submitting request:', err);
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
                {language === 'bn' ? 'এনজিও অনুরোধ ফর্ম' : 'NGO Request Form'}
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
            {language === 'bn' ? 'ত্রাণ সামগ্রীর অনুরোধ করুন' : 'Request Relief Items'}
          </h2>
          <p className="bangla-text text-lg" style={{ color: colors.text.secondary, fontSize: '1.125rem' }}>
            {language === 'bn'
              ? 'আপনার সংস্থার প্রয়োজনীয় ত্রাণ সামগ্রীর জন্য অনুরোধ করুন'
              : 'Request the relief items your organization needs for affected communities'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Organization Information */}
          <div className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
            <h3 className="text-xl font-bold mb-6 bangla-text"
              style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
              {language === 'bn' ? 'সংস্থার তথ্য' : 'Organization Information'}
            </h3>
            <div className="grid md:grid-cols-2 gap-6"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

              <div>
                <label className="block text-sm font-medium mb-2 bangla-text"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                  {language === 'bn' ? 'সংস্থার নাম' : 'Organization Name'} *
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: বাংলাদেশ রেড ক্রিসেন্ট' : 'e.g., Bangladesh Red Crescent'}
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
                  {language === 'bn' ? 'যোগাযোগকারীর নাম' : 'Contact Person'} *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder={language === 'bn' ? 'দায়িত্বশীল ব্যক্তির নাম' : 'Responsible person name'}
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
                  {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={language === 'bn' ? '০১৭xxxxxxxx' : '017xxxxxxxx'}
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
                  {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@ngo.org"
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
            </div>
          </div>

          {/* Item Category Selection */}
          <div className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
            <h3 className="text-xl font-bold mb-6 bangla-text"
              style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
              {language === 'bn' ? 'প্রয়োজনীয় সামগ্রীর ধরন' : 'Required Item Category'}
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

          {/* Rest of the form continues with the same pattern... */}
          {formData.category && (
            <>
              {/* Item Details Section */}
              <div className="rounded-xl shadow-lg p-6"
                style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
                <h3 className="text-xl font-bold mb-6 bangla-text"
                  style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
                  {language === 'bn' ? 'সামগ্রীর বিবরণ' : 'Item Details'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

                  <div>
                    <label className="block text-sm font-medium mb-2 bangla-text"
                      style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                      {language === 'bn' ? 'সামগ্রীর নাম' : 'Item Name'} *
                      <span style={{ fontSize: '0.75rem', color: colors.text.tertiary, fontWeight: 'normal', marginLeft: '0.5rem' }}>
                        ({language === 'bn' ? 'কমপক্ষে ২ অক্ষর' : 'Min 2 characters'})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder={language === 'bn' ? 'যেমন: চাল, ডাল, খিচুড়ি' : 'e.g., Rice, Lentils, Khichuri'}
                      required
                      minLength={2}
                      maxLength={200}
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
                        {language === 'bn' ? 'প্রয়োজনীয় পরিমাণ' : 'Required Quantity'} *
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
                        placeholder={language === 'bn' ? 'কেজি/প্যাকেট/টুকরা' : 'kg/packets/pieces'}
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
                      {language === 'bn' ? 'উপকারভোগীর সংখ্যা' : 'Number of Beneficiaries'} *
                    </label>
                    <input
                      type="number"
                      value={formData.beneficiaries}
                      onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                      placeholder={language === 'bn' ? 'কতজন মানুষের জন্য' : 'How many people'}
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
                      {language === 'bn' ? 'শেষ তারিখ (ঐচ্ছিক)' : 'Deadline (Optional)'}
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 bangla-text"
                    style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                    {language === 'bn' ? 'অতিরিক্ত বিবরণ' : 'Additional Description'} *
                    <span style={{ fontSize: '0.75rem', color: colors.text.tertiary, fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      ({language === 'bn' ? 'কমপক্ষে ১০ অক্ষর' : 'Min 10 characters'})
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'bn' ? 'দুর্যোগের ধরন, আক্রান্ত এলাকার বিবরণ, বিশেষ প্রয়োজন...' : 'Type of disaster, affected area details, special requirements...'}
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: colors.bg.primary,
                      color: colors.text.primary,
                      border: `1px solid ${formData.description.length < 10 && formData.description.length > 0 ? '#ef4444' : colors.border.primary}`,
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    <span style={{ color: formData.description.length < 10 && formData.description.length > 0 ? '#ef4444' : colors.text.tertiary }}>
                      {formData.description.length < 10 && formData.description.length > 0
                        ? (language === 'bn' ? `আরও ${10 - formData.description.length} অক্ষর প্রয়োজন` : `${10 - formData.description.length} more characters needed`)
                        : (language === 'bn' ? 'বিস্তারিত বিবরণ দিন' : 'Please provide detailed description')
                      }
                    </span>
                    <span style={{ color: colors.text.tertiary }}>
                      {formData.description.length}/2000
                    </span>
                  </div>
                </div>
              </div>

              {/* Location and Urgency */}
              <div className="rounded-xl shadow-lg p-6"
                style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
                <h3 className="text-xl font-bold mb-6 bangla-text"
                  style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1.5rem' }}>
                  {language === 'bn' ? 'স্থান ও জরুরিতার মাত্রা' : 'Location & Urgency'}
                </h3>
                <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="grid md:grid-cols-2 gap-6"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'বিভাগ' : 'Division'} *
                      </label>
                      <select
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                        required
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
                      >
                        <option value="">{language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}</option>
                        {bangladeshDivisions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.label[language]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text"
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'জেলা' : 'District'} *
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder={language === 'bn' ? 'যেমন: গাইবান্ধা, কুড়িগ্রাম' : 'e.g., Gaibandha, Kurigram'}
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
                      {language === 'bn' ? 'বিতরণের ঠিকানা' : 'Delivery Address'} *
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      placeholder={language === 'bn' ? 'সম্পূর্ণ ঠিকানা যেখানে সামগ্রী পৌঁছাতে হবে' : 'Complete address where items need to be delivered'}
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

                  {/* Coordinates Input */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'অক্ষাংশ (Latitude)' : 'Latitude'} *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="23.8103"
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
                      <label
                        style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.5rem' }}>
                        {language === 'bn' ? 'দ্রাঘিমাংশ (Longitude)' : 'Longitude'} *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="90.4125"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 bangla-text"
                      style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary, marginBottom: '0.75rem' }}>
                      {language === 'bn' ? 'জরুরিতার মাত্রা' : 'Urgency Level'}
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.organizationName || !formData.itemName || !formData.deliveryLocation}
                  className="px-8 py-3 text-lg font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    borderRadius: '0.75rem',
                    backgroundColor: (isSubmitting || !formData.organizationName || !formData.itemName || !formData.deliveryLocation) ? '#d1d5db' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    cursor: (isSubmitting || !formData.organizationName || !formData.itemName || !formData.deliveryLocation) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {isSubmitting
                    ? (language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...')
                    : (language === 'bn' ? 'অনুরোধ পাঠান' : 'Submit Request')
                  }
                </button>
              </div>
            </>
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
              {language === 'bn' ? 'চ্যাট করে অনুরোধ করুন' : 'Request via Chat'}
            </h3>
            <p className="mb-4 bangla-text" style={{ color: colors.green.primary, marginBottom: '1rem' }}>
              {language === 'bn'
                ? 'AI সহায়কের সাথে চ্যাট করে আপনার প্রয়োজনের কথা জানান'
                : 'Chat with our AI assistant to describe your relief requirements'}
            </p>
            <button
              onClick={() => navigate('/chatbot', { state: { mode: 'ngo' } })}
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

export default NGORequestForm;