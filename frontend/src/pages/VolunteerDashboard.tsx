import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { LanguageSwitcher, useTranslation } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import LeafletMapComponent from '../components/LeafletMapComponent';
import { useRealTimeTracking } from '../hooks/useRealTimeTracking';

interface VolunteerProfile {
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  max_capacity_kg: number;
  current_location: { lat: number; lng: number };
  emergency_contact: string;
  notes?: string;
  status: string;
  created_at: string;
  address?: string;
  district?: string;
  division?: string;
  availability_hours?: Array<{ day: string; start: string; end: string }>;
}

interface DeliveryTask {
  id: string;
  match_id: string;
  status: 'assigned' | 'in_transit_to_pickup' | 'picked_up' | 'in_transit_to_delivery' | 'delivered' | 'completed' | 'cancelled';
  pickup_location?: string;
  delivery_location?: string;
  scheduled_pickup?: string;
  scheduled_delivery?: string;
  special_instructions?: string;
  created_at: string;
  donation: {
    id: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    pickup_address: string;
    pickup_coordinates?: { lat: number; lng: number };
  } | null;
  request: {
    id: string;
    item_name: string;
    delivery_address: string;
    delivery_coordinates?: { lat: number; lng: number };
    urgency: string;
    beneficiaries_count: number;
  } | null;
  estimated_distance?: number;
}

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

const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile' | 'history' | 'map'>('tasks');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Real-time tracking integration
  const {
    currentLocation,
    locationError,
    isTracking,
    startTracking,
    stopTracking,
    updateDeliveryStatus,
    estimateArrivalTime
  } = useRealTimeTracking({
    volunteerId: user?.id || '',
    isActive: activeTab === 'map' || activeTab === 'tasks'
  });
  const [profileFormData, setProfileFormData] = useState({
    vehicle_type: '',
    max_capacity_kg: 0,
    address: '',
    district: '',
    division: '',
    availability_hours: [] as Array<{ day: string; start: string; end: string }>
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVolunteerData();
    }
  }, [user]);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch existing volunteer profile
      let profile: VolunteerProfile | null = null;

      try {
        const profileResponse = await apiService.getVolunteerProfile(user!.id);
        if (profileResponse.success && profileResponse.data) {
          profile = {
            user_id: profileResponse.data.user_id || user!.id,
            full_name: profileResponse.data.user?.full_name || user!.full_name,
            phone: profileResponse.data.user?.phone || user!.phone || '',
            vehicle_type: profileResponse.data.vehicle_type || '',
            max_capacity_kg: profileResponse.data.max_capacity_kg || 0,
            current_location: profileResponse.data.coordinates
              ? { lat: profileResponse.data.coordinates.x, lng: profileResponse.data.coordinates.y }
              : { lat: 23.8103, lng: 90.4125 },
            emergency_contact: profileResponse.data.user?.phone || user!.phone || '',
            notes: profileResponse.data.notes || '',
            status: 'active',
            created_at: profileResponse.data.created_at || new Date().toISOString(),
            address: profileResponse.data.address || '',
            district: profileResponse.data.district || '',
            division: profileResponse.data.division || '',
            availability_hours: profileResponse.data.availability_hours || []
          };
        }
      } catch (profileErr) {
        console.log('No existing volunteer profile found:', profileErr);
      }

      // If no profile exists, create a default one
      if (!profile) {
        profile = {
          user_id: user!.id,
          full_name: user!.full_name,
          phone: user!.phone || '',
          vehicle_type: '',
          max_capacity_kg: 0,
          current_location: { lat: 23.8103, lng: 90.4125 }, // Dhaka coordinates
          emergency_contact: user!.phone || '',
          notes: '',
          status: 'active',
          created_at: new Date().toISOString(),
          address: '',
          district: '',
          division: '',
          availability_hours: []
        };
      }

      setVolunteerProfile(profile);

      // Initialize form data with current profile
      setProfileFormData({
        vehicle_type: profile.vehicle_type || '',
        max_capacity_kg: profile.max_capacity_kg || 0,
        address: profile.address || '',
        district: profile.district || '',
        division: profile.division || '',
        availability_hours: profile.availability_hours || []
      });

      // Fetch delivery tasks
      try {
        const tasksResponse = await apiService.getVolunteerDeliveries(user!.id);
        if (tasksResponse.success && tasksResponse.data) {
          setDeliveryTasks(tasksResponse.data);
        }
      } catch (taskErr) {
        console.log('No delivery tasks found or API not ready:', taskErr);
        setDeliveryTasks([]);
      }
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
      setError('Failed to load volunteer data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return isDark ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit_to_pickup':
      case 'in_transit_to_delivery': return isDark ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked_up': return isDark ? 'bg-purple-900 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
      case 'completed': return isDark ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return isDark ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      default: return isDark ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      assigned: { bn: 'নির্ধারিত', en: 'Assigned' },
      in_transit_to_pickup: { bn: 'পিকআপে যাচ্ছে', en: 'Going to Pickup' },
      picked_up: { bn: 'পিকআপ সম্পন্ন', en: 'Picked Up' },
      in_transit_to_delivery: { bn: 'ডেলিভারিতে যাচ্ছে', en: 'Going to Delivery' },
      delivered: { bn: 'সম্পন্ন', en: 'Delivered' },
      completed: { bn: 'সম্পূর্ণ', en: 'Completed' },
      cancelled: { bn: 'বাতিল', en: 'Cancelled' }
    };
    return statusTexts[status as keyof typeof statusTexts]?.[language] || status;
  };

  const handleProfileUpdate = async () => {
    try {
      setProfileUpdateLoading(true);
      setError('');

      const updateData = {
        vehicle_type: profileFormData.vehicle_type,
        max_capacity_kg: profileFormData.max_capacity_kg,
        address: profileFormData.address,
        district: profileFormData.district,
        division: profileFormData.division,
        availability_hours: profileFormData.availability_hours,
        coordinates: volunteerProfile?.current_location ? {
          lat: volunteerProfile.current_location.lat,
          lng: volunteerProfile.current_location.lng
        } : { lat: 23.8103, lng: 90.4125 }
      };

      const response = await apiService.updateVolunteerProfile(user!.id, updateData);

      if (response.success) {
        // Update local state
        if (volunteerProfile) {
          const updatedProfile = {
            ...volunteerProfile,
            vehicle_type: profileFormData.vehicle_type,
            max_capacity_kg: profileFormData.max_capacity_kg,
            address: profileFormData.address,
            district: profileFormData.district,
            division: profileFormData.division,
            availability_hours: profileFormData.availability_hours
          };
          setVolunteerProfile(updatedProfile);
        }

        setIsEditingProfile(false);
        // Could add a success toast here
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmDelivery = async (deliveryId: string) => {
    try {
      setConfirmingDelivery(deliveryId);

      const confirmationData = {
        confirmation_notes: 'Dummy confirmation notes for hackathon demo',
        recipient_signature: 'dummy_signature_' + Date.now(),
        photo_url: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Delivery+Confirmed'
      };

      const response = await apiService.confirmDelivery(deliveryId, confirmationData);

      if (response.success) {
        // Show success message or update UI
        alert(language === 'bn'
          ? '✅ ডেলিভারি নিশ্চিত হয়েছে! (ডেমো)'
          : '✅ Delivery confirmed successfully! (Demo)'
        );

        // Refresh delivery tasks
        await fetchVolunteerData();
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert(language === 'bn'
        ? '❌ ডেলিভারি নিশ্চিত করতে ব্যর্থ'
        : '❌ Failed to confirm delivery'
      );
    } finally {
      setConfirmingDelivery(null);
    }
  };

  const vehicleOptions = [
    { value: 'bicycle', bn: 'সাইকেল', en: 'Bicycle' },
    { value: 'motorcycle', bn: 'মোটরসাইকেল', en: 'Motorcycle' },
    { value: 'car', bn: 'গাড়ি', en: 'Car' },
    { value: 'truck', bn: 'ট্রাক', en: 'Truck' }
  ];

  const districts = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  const divisions = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ minHeight: '100vh', backgroundColor: colors.bg.primary }}>
        <div className="rounded-xl shadow-lg p-8 text-center border-2"
          style={{
            backgroundColor: colors.bg.tertiary,
            borderRadius: '0.75rem',
            boxShadow: colors.shadow,
            border: `2px solid ${colors.green.light}`
          }}>
          <h2 className="text-2xl font-bold mb-4 bangla-text"
            style={{ color: colors.text.primary, marginBottom: '1rem' }}>
            {language === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}
          </h2>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 font-bold rounded-xl text-white transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: colors.green.primary,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'bn' ? 'লগইন' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ minHeight: '100vh', backgroundColor: colors.bg.primary }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto"
            style={{ borderColor: `${colors.green.light} transparent ${colors.green.primary} transparent` }}>
          </div>
          <p className="mt-6 bangla-text font-medium text-lg"
            style={{ color: colors.text.secondary, marginTop: '1.5rem' }}>
            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!volunteerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4"
        style={{ minHeight: '100vh', backgroundColor: colors.bg.primary }}>
        <div className="rounded-xl shadow-lg p-12 text-center border-2 border-green-100 max-w-md"
          style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, border: `2px solid ${colors.border.accent}` }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ width: '5rem', height: '5rem', backgroundColor: colors.green.bg, borderRadius: '50%', margin: '0 auto 1.5rem auto' }}>
            <svg className="w-10 h-10" style={{ width: '2.5rem', height: '2.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 bangla-text"
            style={{ color: colors.text.primary, marginBottom: '1rem' }}>
            {language === 'bn' ? 'স্বেচ্ছাসেবক প্রোফাইল' : 'Volunteer Profile'}
          </h2>
          <p className="mb-8 bangla-text leading-relaxed"
            style={{ color: colors.text.secondary, marginBottom: '2rem', lineHeight: '1.6' }}>
            {language === 'bn'
              ? 'স্বেচ্ছাসেবক নিবন্ধন বর্তমানে উপলব্ধ নেই। আমরা শীঘ্রই এই সুবিধা চালু করব।'
              : 'Volunteer registration is currently not available. We will launch this feature soon.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 font-bold rounded-xl text-white transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: colors.green.primary,
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {language === 'bn' ? 'হোমে ফিরুন' : 'Go to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg.primary
      }}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
    >

      {/* Header */}
      <motion.header
        className="shadow-lg border-b"
        style={{
          backgroundColor: colors.bg.primary,
          boxShadow: colors.shadow,
          borderBottom: `1px solid ${colors.border.primary}`
        }}
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/')}
                className="transition-colors p-2 rounded-lg border"
                style={{
                  color: colors.green.primary,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: colors.green.bg,
                  border: `1px solid ${colors.green.light}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-black bangla-text tracking-tight"
                  style={{ fontSize: '1.875rem', fontWeight: '900', color: colors.text.primary, letterSpacing: '-0.025em' }}>
                  {language === 'bn' ? 'স্বেচ্ছাসেবক ড্যাশবোর্ড' : 'Volunteer Dashboard'}
                </h1>
                <p className="text-lg bangla-text font-medium"
                  style={{ color: colors.text.secondary, fontSize: '1.125rem', fontWeight: '500', marginTop: '0.25rem' }}>
                  {language === 'bn' ? 'স্বাগতম, ' : 'Welcome, '}{volunteerProfile.full_name || user?.full_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg border"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: colors.green.bg,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${colors.green.light}`
                }}>
                <div className="w-3 h-3 rounded-full animate-pulse"
                  style={{ width: '0.75rem', height: '0.75rem', backgroundColor: colors.green.primary, borderRadius: '50%' }}>
                </div>
                <span className="text-sm font-medium bangla-text"
                  style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.green.primary }}>
                  {language === 'bn'
                    ? `${volunteerProfile.vehicle_type || 'N/A'} • ${volunteerProfile.max_capacity_kg || 0} কেজি`
                    : `${volunteerProfile.vehicle_type || 'N/A'} • ${volunteerProfile.max_capacity_kg || 0} kg`}
                </span>
              </div>

              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
                  backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                  color: isDark ? '#fca5a5' : '#dc2626',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-xl border-l-4 border-red-500"
            style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              marginBottom: '2rem',
              padding: '1.5rem',
              borderRadius: '0.75rem'
            }}>
            <p className="bangla-text font-medium" style={{ color: isDark ? '#f87171' : '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

          <div className="rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', padding: '1.5rem', boxShadow: colors.shadow, borderLeft: '4px solid #22c55e', transition: 'transform 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary }}>
                  {language === 'bn' ? 'আজকের ডেলিভারি' : "Today's Deliveries"}
                </p>
                <p className="text-3xl font-bold" style={{ fontSize: '1.875rem', fontWeight: '700', color: colors.text.primary }}>
                  {deliveryTasks.filter(task =>
                    new Date(task.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ width: '3rem', height: '3rem', backgroundColor: colors.green.light, borderRadius: '50%' }}>
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', padding: '1.5rem', boxShadow: colors.shadow, borderLeft: '4px solid #3b82f6', transition: 'transform 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary }}>
                  {language === 'bn' ? 'মোট কাজ' : 'Total Tasks'}
                </p>
                <p className="text-3xl font-bold" style={{ fontSize: '1.875rem', fontWeight: '700', color: colors.text.primary }}>
                  {deliveryTasks.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ width: '3rem', height: '3rem', backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', borderRadius: '50%' }}>
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: isDark ? '#60a5fa' : '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6 border-l-4 transform hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', padding: '1.5rem', boxShadow: colors.shadow, borderLeft: '4px solid #eab308', transition: 'transform 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary }}>
                  {language === 'bn' ? 'জরুরি কাজ' : 'Urgent Tasks'}
                </p>
                <p className="text-3xl font-bold" style={{ fontSize: '1.875rem', fontWeight: '700', color: colors.text.primary }}>
                  {deliveryTasks.filter(task =>
                    task.request?.urgency === 'high' || task.request?.urgency === 'critical'
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ width: '3rem', height: '3rem', backgroundColor: isDark ? '#92400e' : '#fef3c7', borderRadius: '50%' }}>
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: isDark ? '#f59e0b' : '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6 border-l-4 transform hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', padding: '1.5rem', boxShadow: colors.shadow, borderLeft: '4px solid #8b5cf6', transition: 'transform 0.3s ease' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium bangla-text" style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text.secondary }}>
                  {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                </p>
                <p className="text-3xl font-bold" style={{ fontSize: '1.875rem', fontWeight: '700', color: colors.text.primary }}>
                  {deliveryTasks.filter(task => task.status === 'delivered' || task.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ width: '3rem', height: '3rem', backgroundColor: isDark ? '#581c87' : '#f3e8ff', borderRadius: '50%' }}>
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: isDark ? '#a855f7' : '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border rounded-lg overflow-hidden shadow-sm"
            style={{ backgroundColor: colors.bg.tertiary, border: `1px solid ${colors.border.primary}`, borderRadius: '0.5rem', overflow: 'hidden', boxShadow: colors.shadow }}>
            <nav className="flex"
              style={{ display: 'flex' }}>
              {[
                { id: 'tasks', label: { bn: 'বরাদ্দকৃত কাজ', en: 'Active Tasks' }, icon: '📦' },
                { id: 'map', label: { bn: 'লাইভ ম্যাপ', en: 'Live Map' }, icon: '🗺️' },
                { id: 'profile', label: { bn: 'প্রোফাইল', en: 'Profile' }, icon: '👤' },
                { id: 'history', label: { bn: 'ইতিহাস', en: 'History' }, icon: '📋' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-300 bangla-text`}
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backgroundColor: activeTab === tab.id ? colors.green.primary : 'transparent',
                    color: activeTab === tab.id ? 'white' : colors.text.secondary,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label[language]}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'tasks' && (
            <div className="rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, overflow: 'hidden' }}>

              <div className="px-6 py-4"
                style={{ padding: '1rem 1.5rem' }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold bangla-text" style={{ color: colors.text.primary }}>
                    {language === 'bn' ? `বর্তমান কাজ (${deliveryTasks.length})` : `Current Tasks (${deliveryTasks.length})`}
                  </h2>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg transition-all duration-300"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${colors.border.primary}`,
                      backgroundColor: colors.bg.secondary,
                      color: colors.text.primary,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {deliveryTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ width: '6rem', height: '6rem', backgroundColor: colors.green.bg, borderRadius: '50%', margin: '0 auto 1.5rem auto' }}>
                      <svg className="w-12 h-12" style={{ width: '3rem', height: '3rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 12h4l3 8 4-8h3" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bangla-text" style={{ color: colors.text.primary }}>
                      {language === 'bn' ? 'কোন কাজ নেই' : 'No Tasks Available'}
                    </h3>
                    <p className="text-lg bangla-text leading-relaxed" style={{ color: colors.text.secondary, lineHeight: '1.6' }}>
                      {language === 'bn'
                        ? 'বর্তমানে আপনার জন্য কোন ডেলিভারি কাজ নেই। নতুন কাজের জন্য অপেক্ষা করুন।'
                        : 'Currently, there are no delivery tasks assigned to you. Please wait for new assignments.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {deliveryTasks.map(task => (
                      <div key={task.id}
                        className="border-2 border-transparent hover:border-green-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          border: `2px solid transparent`,
                          transition: 'all 0.3s ease'
                        }}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-3 h-3 rounded-full animate-pulse"
                                style={{
                                  width: '0.75rem',
                                  height: '0.75rem',
                                  backgroundColor: task.status === 'delivered'
                                    ? (isDark ? '#4ade80' : '#22c55e')
                                    : (isDark ? '#fbbf24' : '#eab308'),
                                  borderRadius: '50%'
                                }}>
                              </div>
                              <h3 className="text-xl font-bold bangla-text" style={{ color: colors.text.primary }}>
                                {task.donation?.item_name}
                              </h3>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center space-x-2">
                                <span>📦</span>
                                <span className="text-sm bangla-text" style={{ color: colors.text.secondary }}>
                                  {language === 'bn' ? 'পরিমাণ:' : 'Quantity:'} {task.donation?.quantity} {task.donation?.unit}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>📍</span>
                                <span className="text-sm bangla-text" style={{ color: colors.text.secondary }}>
                                  {language === 'bn' ? 'পিকআপ:' : 'Pickup:'} {task.donation?.pickup_address || task.pickup_location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>🎯</span>
                                <span className="text-sm bangla-text" style={{ color: colors.text.secondary }}>
                                  {language === 'bn' ? 'ডেলিভারি:' : 'Delivery:'} {task.request?.delivery_address || task.delivery_location}
                                </span>
                              </div>
                              {task.request?.urgency && (
                                <div className="flex items-center space-x-2">
                                  <span>⚡</span>
                                  <span className="text-sm bangla-text capitalize" style={{
                                    color: task.request.urgency === 'high' || task.request.urgency === 'critical' ? '#dc2626' : colors.text.secondary
                                  }}>
                                    {language === 'bn' ? 'জরুরি:' : 'Urgency:'} {task.request.urgency}
                                  </span>
                                </div>
                              )}
                              {task.request?.beneficiaries_count && (
                                <div className="flex items-center space-x-2">
                                  <span>👥</span>
                                  <span className="text-sm bangla-text" style={{ color: colors.text.secondary }}>
                                    {language === 'bn' ? 'উপকারভোগী:' : 'Beneficiaries:'} {task.request.beneficiaries_count}
                                  </span>
                                </div>
                              )}
                              {task.special_instructions && (
                                <div className="flex items-start space-x-2">
                                  <span>📝</span>
                                  <div className="flex-1">
                                    <span className="text-sm bangla-text block" style={{ color: colors.text.secondary }}>
                                      {language === 'bn' ? 'বিশেষ নির্দেশনা:' : 'Instructions:'}
                                    </span>
                                    <span className="text-sm bangla-text" style={{ color: colors.text.primary }}>
                                      {task.special_instructions}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t"
                              style={{ borderTop: `1px solid ${colors.border.secondary}`, paddingTop: '1rem' }}>
                              <span className="text-xs bangla-text" style={{ color: colors.text.tertiary }}>
                                {new Date(task.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                              </span>

                              {/* Delivery Action Buttons */}
                              {(task.status === 'assigned' || task.status === 'picked_up') && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleConfirmDelivery(task.id)}
                                    disabled={confirmingDelivery === task.id}
                                    className="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                                    style={{
                                      backgroundColor: confirmingDelivery === task.id ? '#9ca3af' : colors.green.primary,
                                      color: 'white',
                                      padding: '0.5rem 1rem',
                                      fontSize: '0.875rem',
                                      borderRadius: '0.5rem',
                                      border: 'none',
                                      cursor: confirmingDelivery === task.id ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {confirmingDelivery === task.id
                                      ? (language === 'bn' ? 'নিশ্চিত করা হচ্ছে...' : 'Confirming...')
                                      : (language === 'bn' ? 'ডেলিভারি নিশ্চিত করুন' : 'Confirm Delivery')
                                    }
                                  </button>
                                </div>
                              )}

                              {(task.status === 'delivered' || task.status === 'completed') && (
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4" style={{ width: '1rem', height: '1rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm font-medium bangla-text" style={{ color: colors.green.primary }}>
                                    {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <span className={`px-4 py-2 text-sm rounded-full font-medium ml-4 ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* Real-time Tracking Controls */}
              <motion.div
                className="rounded-xl shadow-lg p-6"
                style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold bangla-text" style={{ color: colors.text.primary }}>
                    {language === 'bn' ? 'রিয়েল-টাইম ট্র্যাকিং' : 'Real-time Tracking'}
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={isTracking ? stopTracking : startTracking}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isTracking
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        backgroundColor: isTracking ? '#dc2626' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isTracking
                        ? (language === 'bn' ? 'ট্র্যাকিং বন্ধ করুন' : 'Stop Tracking')
                        : (language === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking')
                      }
                    </button>
                  </div>
                </div>

                {/* Location Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.bg.secondary, borderRadius: '0.5rem', padding: '1rem' }}>
                    <div className="text-2xl font-bold" style={{ color: isTracking ? colors.green.primary : colors.text.secondary }}>
                      {isTracking ? '🟢' : '🔴'}
                    </div>
                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                      {language === 'bn' ? 'ট্র্যাকিং স্ট্যাটাস' : 'Tracking Status'}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.bg.secondary, borderRadius: '0.5rem', padding: '1rem' }}>
                    <div className="text-2xl font-bold" style={{ color: currentLocation ? colors.green.primary : colors.text.secondary }}>
                      📍
                    </div>
                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                      {currentLocation
                        ? (language === 'bn' ? 'অবস্থান পাওয়া গেছে' : 'Location Found')
                        : (language === 'bn' ? 'অবস্থান খোঁজা হচ্ছে' : 'Finding Location')
                      }
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.bg.secondary, borderRadius: '0.5rem', padding: '1rem' }}>
                    <div className="text-2xl font-bold" style={{ color: deliveryTasks.length > 0 ? colors.green.primary : colors.text.secondary }}>
                      📦
                    </div>
                    <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                      {language === 'bn' ? `${deliveryTasks.length} টি কাজ` : `${deliveryTasks.length} Tasks`}
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {locationError && (
                  <div className="mb-4 p-4 rounded-lg border-l-4 border-red-500" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                    <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{locationError}</p>
                  </div>
                )}
              </motion.div>

              {/* Google Maps Component */}
              <motion.div
                className="rounded-xl shadow-lg overflow-hidden"
                style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow }}
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="px-6 py-4 border-b" style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.border.primary}` }}>
                  <h3 className="text-lg font-semibold bangla-text" style={{ color: colors.text.primary }}>
                    {language === 'bn' ? 'ডেলিভারি ম্যাপ' : 'Delivery Map'}
                  </h3>
                </div>

                <div className="p-6" style={{ padding: '1.5rem' }}>
                  <LeafletMapComponent
                    locations={[
                      // Add delivery task locations
                      ...deliveryTasks.flatMap(task => [
                        // Pickup location
                        ...(task.donation?.pickup_coordinates ? [{
                          id: `pickup-${task.id}`,
                          lat: task.donation.pickup_coordinates.lat,
                          lng: task.donation.pickup_coordinates.lng,
                          title: task.donation.item_name,
                          type: 'pickup' as const,
                          description: `${language === 'bn' ? 'পিকআপ' : 'Pickup'}: ${task.donation.pickup_address}`,
                          status: task.status
                        }] : []),

                        // Delivery location
                        ...(task.request?.delivery_coordinates ? [{
                          id: `delivery-${task.id}`,
                          lat: task.request.delivery_coordinates.lat,
                          lng: task.request.delivery_coordinates.lng,
                          title: task.request.item_name,
                          type: 'delivery' as const,
                          description: `${language === 'bn' ? 'ডেলিভারি' : 'Delivery'}: ${task.request.delivery_address}`,
                          status: task.status
                        }] : [])
                      ]),

                      // Add demo locations when no real tasks are available (for demo purposes)
                      ...(deliveryTasks.length === 0 ? [
                        {
                          id: 'demo-pickup-1',
                          lat: 23.8103,
                          lng: 90.4125,
                          title: language === 'bn' ? 'খাদ্য সংগ্রহ' : 'Food Collection',
                          type: 'pickup' as const,
                          description: language === 'bn' ? 'ধানমন্ডি এলাকা থেকে খাদ্য সংগ্রহ' : 'Food collection from Dhanmondi area',
                          status: 'assigned'
                        },
                        {
                          id: 'demo-delivery-1',
                          lat: 23.7806,
                          lng: 90.4193,
                          title: language === 'bn' ? 'পানীয় জল বিতরণ' : 'Water Distribution',
                          type: 'delivery' as const,
                          description: language === 'bn' ? 'পুরাতন ঢাকায় পানীয় জল পৌঁছে দিন' : 'Deliver water to Old Dhaka area',
                          status: 'assigned'
                        },
                        {
                          id: 'demo-pickup-2',
                          lat: 23.8223,
                          lng: 90.3654,
                          title: language === 'bn' ? 'কম্বল সংগ্রহ' : 'Blanket Collection',
                          type: 'pickup' as const,
                          description: language === 'bn' ? 'উত্তরা থেকে কম্বল সংগ্রহ করুন' : 'Collect blankets from Uttara',
                          status: 'assigned'
                        }
                      ] : [])
                    ]}
                    volunteerLocation={currentLocation || undefined}
                    isTracking={isTracking}
                    center={currentLocation || { lat: 23.8103, lng: 90.4125 }}
                    zoom={13}
                    className="w-full h-[500px]"
                  />
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow }}>

              <div className="px-6 py-8"
                style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ width: '4rem', height: '4rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
                      <svg className="w-8 h-8 text-white" style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bangla-text" style={{ color: colors.text.primary }}>
                        {volunteerProfile.full_name || user?.full_name}
                      </h2>
                      <p className="bangla-text" style={{ color: colors.text.secondary }}>
                        {language === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteer'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 rounded-lg transition-all duration-300 font-medium bangla-text"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${colors.border.primary}`,
                      backgroundColor: colors.bg.secondary,
                      color: colors.text.primary,
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {isEditingProfile
                      ? (language === 'bn' ? 'বাতিল' : 'Cancel')
                      : (language === 'bn' ? 'সম্পাদনা' : 'Edit Profile')
                    }
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Vehicle Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text" style={{ color: colors.text.secondary }}>
                          {language === 'bn' ? 'যানবাহনের ধরন' : 'Vehicle Type'} *
                        </label>
                        <select
                          value={profileFormData.vehicle_type}
                          onChange={(e) => handleFormChange('vehicle_type', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bangla-text"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${colors.border.primary}`,
                            backgroundColor: colors.bg.secondary,
                            color: colors.text.primary
                          }}
                        >
                          <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select Vehicle Type'}</option>
                          {vehicleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option[language]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Max Capacity */}
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text" style={{ color: colors.text.secondary }}>
                          {language === 'bn' ? 'সর্বোচ্চ ধারণক্ষমতা (কেজি)' : 'Max Capacity (kg)'} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={profileFormData.max_capacity_kg}
                          onChange={(e) => handleFormChange('max_capacity_kg', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${colors.border.primary}`,
                            backgroundColor: colors.bg.secondary,
                            color: colors.text.primary
                          }}
                          placeholder={language === 'bn' ? 'যেমন: ৫০' : 'e.g., 50'}
                        />
                      </div>

                      {/* Division */}
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text" style={{ color: colors.text.secondary }}>
                          {language === 'bn' ? 'বিভাগ' : 'Division'}
                        </label>
                        <select
                          value={profileFormData.division}
                          onChange={(e) => handleFormChange('division', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 transition-all duration-300 bangla-text"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${colors.border.primary}`,
                            backgroundColor: colors.bg.secondary,
                            color: colors.text.primary
                          }}
                        >
                          <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select Division'}</option>
                          {divisions.map(division => (
                            <option key={division} value={division}>{division}</option>
                          ))}
                        </select>
                      </div>

                      {/* District */}
                      <div>
                        <label className="block text-sm font-medium mb-2 bangla-text" style={{ color: colors.text.secondary }}>
                          {language === 'bn' ? 'জেলা' : 'District'}
                        </label>
                        <select
                          value={profileFormData.district}
                          onChange={(e) => handleFormChange('district', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 transition-all duration-300 bangla-text"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${colors.border.primary}`,
                            backgroundColor: colors.bg.secondary,
                            color: colors.text.primary
                          }}
                        >
                          <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select District'}</option>
                          {districts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2 bangla-text" style={{ color: colors.text.secondary }}>
                        {language === 'bn' ? 'ঠিকানা' : 'Address'}
                      </label>
                      <textarea
                        value={profileFormData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 transition-all duration-300 bangla-text"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${colors.border.primary}`,
                          backgroundColor: colors.bg.secondary,
                          color: colors.text.primary,
                          resize: 'vertical'
                        }}
                        placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ ঠিকানা লিখুন' : 'Enter your full address'}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4" style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                      <button
                        onClick={handleProfileUpdate}
                        disabled={profileUpdateLoading || !profileFormData.vehicle_type || !profileFormData.max_capacity_kg}
                        className="flex-1 py-3 px-6 font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:bg-gray-400"
                        style={{
                          flex: 1,
                          backgroundColor: profileUpdateLoading || !profileFormData.vehicle_type || !profileFormData.max_capacity_kg ? '#9ca3af' : '#059669',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: profileUpdateLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {profileUpdateLoading
                          ? (language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...')
                          : (language === 'bn' ? 'প্রোফাইল আপডেট করুন' : 'Update Profile')
                        }
                      </button>
                    </div>

                    <p className="text-sm text-center bangla-text" style={{ color: colors.text.tertiary }}>
                      {language === 'bn'
                        ? '* চিহ্নিত ক্ষেত্রগুলি বাধ্যতামূলক'
                        : '* Required fields are marked with asterisk'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                          </label>
                          <p className="text-lg bangla-text" style={{ color: colors.text.primary }}>{volunteerProfile.phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'যানবাহনের ধরন' : 'Vehicle Type'}
                          </label>
                          <p className="text-lg bangla-text capitalize" style={{ color: colors.text.primary }}>
                            {volunteerProfile.vehicle_type ? (
                              vehicleOptions.find(v => v.value === volunteerProfile.vehicle_type)?.[language] || volunteerProfile.vehicle_type
                            ) : (
                              <span style={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                                {language === 'bn' ? 'নির্ধারিত নয়' : 'Not set'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'বিভাগ' : 'Division'}
                          </label>
                          <p className="text-lg bangla-text" style={{ color: colors.text.primary }}>
                            {volunteerProfile.division || (
                              <span style={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                                {language === 'bn' ? 'নির্ধারিত নয়' : 'Not set'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'সর্বোচ্চ ধারণক্ষমতা' : 'Max Capacity'}
                          </label>
                          <p className="text-lg bangla-text" style={{ color: colors.text.primary }}>
                            {volunteerProfile.max_capacity_kg ? (
                              `${volunteerProfile.max_capacity_kg} ${language === 'bn' ? 'কেজি' : 'kg'}`
                            ) : (
                              <span style={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                                {language === 'bn' ? 'নির্ধারিত নয়' : 'Not set'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'জেলা' : 'District'}
                          </label>
                          <p className="text-lg bangla-text" style={{ color: colors.text.primary }}>
                            {volunteerProfile.district || (
                              <span style={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                                {language === 'bn' ? 'নির্ধারিত নয়' : 'Not set'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                            {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ width: '0.75rem', height: '0.75rem', backgroundColor: colors.green.primary, borderRadius: '50%' }}></div>
                            <span className="text-lg bangla-text" style={{ color: colors.text.primary }}>
                              {language === 'bn' ? 'সক্রিয়' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {volunteerProfile.address && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-1 bangla-text" style={{ color: colors.text.secondary }}>
                          {language === 'bn' ? 'ঠিকানা' : 'Address'}
                        </label>
                        <p className="text-lg bangla-text leading-relaxed" style={{ color: colors.text.primary, lineHeight: '1.6' }}>
                          {volunteerProfile.address}
                        </p>
                      </div>
                    )}

                    {(!volunteerProfile.vehicle_type || !volunteerProfile.max_capacity_kg) && (
                      <div className="mt-6 p-4 rounded-lg border-l-4"
                        style={{
                          backgroundColor: '#fef3c7',
                          borderLeft: '4px solid #f59e0b',
                          padding: '1rem',
                          borderRadius: '0.5rem'
                        }}>
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem', color: isDark ? '#fbbf24' : '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <h4 className="font-semibold bangla-text" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>
                              {language === 'bn' ? 'প্রোফাইল সম্পূর্ণ করুন' : 'Complete Your Profile'}
                            </h4>
                            <p className="text-sm bangla-text" style={{ color: isDark ? '#fcd34d' : '#b45309' }}>
                              {language === 'bn'
                                ? 'ডেলিভারি কাজ পেতে আপনার যানবাহনের তথ্য এবং ধারণক্ষমতা নির্ধারণ করুন।'
                                : 'Set your vehicle type and capacity to receive delivery assignments.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="rounded-xl shadow-lg overflow-hidden"
              style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow }}>

              <div className="px-6 py-4"
                style={{ padding: '1rem 1.5rem' }}>
                <h2 className="text-xl font-bold bangla-text" style={{ color: colors.text.primary }}>
                  {language === 'bn' ? 'ডেলিভারি ইতিহাস' : 'Delivery History'}
                </h2>
              </div>

              <div className="p-6">
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ width: '6rem', height: '6rem', backgroundColor: colors.green.bg, borderRadius: '50%', margin: '0 auto 1.5rem auto' }}>
                    <svg className="w-12 h-12" style={{ width: '3rem', height: '3rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bangla-text" style={{ color: colors.text.primary }}>
                    {language === 'bn' ? 'কোন ইতিহাস নেই' : 'No History Available'}
                  </h3>
                  <p className="text-lg bangla-text" style={{ color: colors.text.secondary }}>
                    {language === 'bn'
                      ? 'আপনার ডেলিভারি ইতিহাস এখানে প্রদর্শিত হবে।'
                      : 'Your delivery history will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default VolunteerDashboard;