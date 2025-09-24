import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login (you might want to use your router here)
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  user_type: 'donor' | 'ngo' | 'volunteer';
  organization_name?: string;
  is_verified: boolean;
  profile_image_url?: string;
  created_at: string;
}

interface Donation {
  id: string;
  donor_id: string;
  item_name: string;
  category: 'food' | 'clothes' | 'medicine' | 'blankets' | 'water' | 'hygiene' | 'other';
  quantity: number;
  unit: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_validation' | 'available' | 'matched' | 'delivered' | 'cancelled';
  pickup_address: string;
  pickup_coordinates: { lat: number; lng: number };
  expiry_date?: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
}

interface Request {
  id: string;
  ngo_id: string;
  category: 'food' | 'clothes' | 'medicine' | 'blankets' | 'water' | 'hygiene' | 'other';
  item_name: string;
  description: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  beneficiaries_count: number;
  target_demographic?: string;
  emergency_type?: string;
  status: 'pending_validation' | 'active' | 'partially_matched' | 'fully_matched' | 'in_progress' | 'fulfilled' | 'expired' | 'cancelled';
  delivery_address: string;
  delivery_coordinates: { lat: number; lng: number };
  delivery_instructions?: string;
  accessibility_notes?: string;
  deadline: string;
  preferred_delivery_time?: any;
  created_at: string;
  updated_at?: string;
}

interface Volunteer {
  user_id: string;
  availability_hours: Array<{ day: string; start: string; end: string }>;
  transport_type: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'van' | 'truck';
  max_distance_km: number;
  preferred_areas?: string[];
  is_available: boolean;
  current_coordinates?: { lat: number; lng: number };
  created_at: string;
  updated_at?: string;
}

interface Match {
  id: string;
  donation_id: string;
  request_id: string;
  volunteer_id?: string;
  status: 'pending_volunteer' | 'assigned' | 'completed' | 'cancelled';
  matching_score?: number;
  ai_reasoning?: string;
  matched_at: string;
  completed_at?: string;
}

// API Service Class
class ApiService {
  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Authentication APIs
  async register(userData: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    user_type: 'donor' | 'ngo' | 'volunteer';
    organization_name?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: {
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async verifyPhone(data: {
    phone: string;
    otp: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/auth/verify-phone', data);
    return response.data;
  }

  async sendOTP(phone: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data;
  }

  // Donations APIs
  async getDonations(filters?: {
    status?: string;
    category?: string;
    urgency?: string;
    limit?: number;
  }): Promise<ApiResponse<Donation[]>> {
    const response = await apiClient.get('/donations', { params: filters });
    return response.data;
  }

  async getDonation(id: string): Promise<ApiResponse<Donation>> {
    const response = await apiClient.get(`/donations/${id}`);
    return response.data;
  }

  async createDonation(donationData: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<ApiResponse<Donation>> {
    const response = await apiClient.post('/donations', donationData);
    return response.data;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<ApiResponse<Donation>> {
    const response = await apiClient.put(`/donations/${id}`, updates);
    return response.data;
  }

  async deleteDonation(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/donations/${id}`);
    return response.data;
  }

  async findNearbyDonations(lat: number, lng: number, radius = 10): Promise<ApiResponse<Donation[]>> {
    const response = await apiClient.get(`/donations/nearby/${lat}/${lng}`, {
      params: { radius }
    });
    return response.data;
  }

  // Requests APIs
  async getRequests(filters?: {
    status?: string;
    urgency?: string;
    limit?: number;
  }): Promise<ApiResponse<Request[]>> {
    const response = await apiClient.get('/requests', { params: filters });
    return response.data;
  }

  async getRequest(id: string): Promise<ApiResponse<Request>> {
    const response = await apiClient.get(`/requests/${id}`);
    return response.data;
  }

  async createRequest(requestData: Omit<Request, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<ApiResponse<Request>> {
    const response = await apiClient.post('/requests', requestData);
    return response.data;
  }

  async updateRequest(id: string, updates: Partial<Request>): Promise<ApiResponse<Request>> {
    const response = await apiClient.put(`/requests/${id}`, updates);
    return response.data;
  }

  async getMatchingDonations(requestId: string): Promise<ApiResponse<Donation[]>> {
    const response = await apiClient.get(`/requests/${requestId}/matching-donations`);
    return response.data;
  }

  // Volunteers APIs
  async getVolunteers(filters?: {
    available_only?: boolean;
    transport_type?: string;
    max_distance?: number;
    limit?: number;
  }): Promise<ApiResponse<Volunteer[]>> {
    const response = await apiClient.get('/volunteers', { params: filters });
    return response.data;
  }

  async createVolunteer(volunteerData: {
    user_id: string;
    full_name: string;
    phone: string;
    vehicle_type: string;
    max_capacity_kg: number;
    current_location: { lat: number; lng: number };
    emergency_contact: string;
    notes?: string;
  }): Promise<ApiResponse<Volunteer>> {
    const response = await apiClient.post('/volunteers', volunteerData);
    return response.data;
  }

  async registerVolunteer(volunteerData: Omit<Volunteer, 'created_at' | 'updated_at'>): Promise<ApiResponse<Volunteer>> {
    const response = await apiClient.post('/volunteers', volunteerData);
    return response.data;
  }

  async updateVolunteerAvailability(userId: string, data: {
    is_available: boolean;
    current_coordinates?: { lat: number; lng: number };
    availability_hours?: Array<{ day: string; start: string; end: string }>;
  }): Promise<ApiResponse<Volunteer>> {
    const response = await apiClient.put(`/volunteers/${userId}/availability`, data);
    return response.data;
  }

  async getVolunteerDeliveries(userId: string, status?: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`/deliveries/volunteer/${userId}`, {
      params: { status }
    });
    return response.data;
  }

  async confirmDelivery(deliveryId: string, confirmationData: {
    confirmation_notes?: string;
    recipient_signature?: string;
    photo_url?: string;
  }): Promise<ApiResponse<any>> {
    console.log(`📋 Confirming delivery ${deliveryId} (DUMMY)`);
    const response = await apiClient.post(`/deliveries/${deliveryId}/confirm`, confirmationData);
    return response.data;
  }

  async getVolunteerProfile(userId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/volunteers/${userId}`);
    return response.data;
  }

  async updateVolunteerProfile(userId: string, profileData: {
    vehicle_type?: string;
    max_capacity_kg?: number;
    availability_hours?: Array<{ day: string; start: string; end: string }>;
    address?: string;
    district?: string;
    division?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/volunteers', {
      user_id: userId,
      ...profileData
    });
    return response.data;
  }

  // Matching APIs
  async getMatches(filters?: {
    status?: string;
    volunteer_id?: string;
    donation_id?: string;
    request_id?: string;
  }): Promise<ApiResponse<Match[]>> {
    const response = await apiClient.get('/matching', { params: filters });
    return response.data;
  }

  async createMatch(matchData: {
    donation_id: string;
    request_id: string;
    volunteer_id?: string;
    matching_score?: number;
    ai_reasoning?: string;
  }): Promise<ApiResponse<Match>> {
    const response = await apiClient.post('/matching/create', matchData);
    return response.data;
  }

  async updateMatchVolunteer(matchId: string, volunteerId: string): Promise<ApiResponse<Match>> {
    console.log(`🤝 Updating match ${matchId} with volunteer ${volunteerId}`);
    const response = await apiClient.put(`/matching/${matchId}/volunteer`, {
      volunteer_id: volunteerId
    });
    return response.data;
  }

  async getAIMatchingSuggestions(data: {
    request_id?: string;
    donation_id?: string;
    max_suggestions?: number;
  }): Promise<ApiResponse<any[]>> {
    const response = await apiClient.post('/matching/ai-suggest', data);
    return response.data;
  }

  // Deliveries APIs
  async createDelivery(deliveryData: {
    match_id: string;
    volunteer_id?: string;
    pickup_location: string;
    pickup_coordinates?: { lat: number; lng: number };
    delivery_location: string;
    delivery_coordinates?: { lat: number; lng: number };
    scheduled_pickup?: string;
    scheduled_delivery?: string;
    special_instructions?: string;
  }): Promise<ApiResponse<{
    id: string;
    match_id: string;
    volunteer_id: string | null;
    pickup_location: string;
    pickup_coordinates: any;
    delivery_location: string;
    delivery_coordinates: any;
    status: string;
    scheduled_pickup: string | null;
    scheduled_delivery: string | null;
    actual_pickup: string | null;
    actual_delivery: string | null;
    special_instructions: string | null;
    created_at: string;
    updated_at: string;
  }>> {
    console.log('📦 Creating delivery record');
    const response = await apiClient.post('/deliveries', deliveryData);
    return response.data;
  }

  async getDeliveries(filters?: {
    status?: string;
    volunteer_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    deliveries: Array<{
      id: string;
      match_id: string;
      volunteer_id: string | null;
      pickup_location: string;
      pickup_coordinates: any;
      delivery_location: string;
      delivery_coordinates: any;
      status: string;
      scheduled_pickup: string | null;
      scheduled_delivery: string | null;
      actual_pickup: string | null;
      actual_delivery: string | null;
      special_instructions: string | null;
      created_at: string;
      updated_at: string;
      match: any;
      volunteer: any;
    }>;
    total: number;
  }>> {
    const response = await apiClient.get('/deliveries', { params: filters });
    return response.data;
  }

  async updateDeliveryStatus(deliveryId: string, statusData: {
    status: string;
    actual_pickup?: string;
    actual_delivery?: string;
    notes?: string;
  }): Promise<ApiResponse<{
    id: string;
    match_id: string;
    volunteer_id: string | null;
    status: string;
    updated_at: string;
  }>> {
    console.log(`📦 Updating delivery ${deliveryId} status to ${statusData.status}`);
    const response = await apiClient.put(`/deliveries/${deliveryId}/status`, statusData);
    return response.data;
  }

  async assignVolunteerToDelivery(deliveryId: string, volunteerId: string): Promise<ApiResponse<{
    id: string;
    match_id: string;
    volunteer_id: string;
    status: string;
    updated_at: string;
    volunteer: any;
  }>> {
    console.log(`🚚 Assigning volunteer ${volunteerId} to delivery ${deliveryId}`);
    const response = await apiClient.post(`/deliveries/${deliveryId}/assign-volunteer`, {
      volunteer_id: volunteerId
    });
    return response.data;
  }

  // Chat APIs
  async sendChatMessage(data: {
    message: string;
    user_id: string;
    session_id: string;
    language?: 'en' | 'bn';
    context?: any;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/chat/message', data);
    return response.data;
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async voiceToText(audioData: string, language = 'bn'): Promise<ApiResponse<{ transcription: string; confidence: number }>> {
    const response = await apiClient.post('/chat/voice-to-text', {
      audio_data: audioData,
      language
    });
    return response.data;
  }

  async textToVoice(text: string, language = 'bn'): Promise<ApiResponse<{ audio_url: string }>> {
    const response = await apiClient.post('/chat/text-to-voice', {
      text,
      language
    });
    return response.data;
  }

  // AI-Powered Routing APIs (Production Version)
  async assignVolunteer(assignmentData: {
    matchId: string;
    pickupLocation: { lat: number; lng: number; address?: string };
    deliveryLocation: { lat: number; lng: number; address?: string };
    itemCategory: string;
    urgency: string;
    itemWeight?: number;
    itemQuantity?: number;
  }): Promise<ApiResponse<{
    assignedVolunteer: {
      id: string;
      name: string;
      phone: string;
      vehicleType: string;
      capacity: number;
      estimatedDistance: number;
      estimatedDuration: number;
      aiReasoning: string;
      confidence: number;
    };
    aiRoute: {
      pickup: { address: string; eta: string };
      delivery: { address: string; eta: string };
      totalDistance: number;
      totalTime: string;
      optimization: string;
    };
    deliveryId: string;
    status: string;
    note?: string;
  }>> {
    console.log('🤖 Using AI-powered routing for volunteer assignment');
    const response = await apiClient.post('/ai-routing/assign', assignmentData);
    return response.data;
  }

  async getDeliveryStatus(deliveryId: string): Promise<ApiResponse<{
    delivery: {
      id: string;
      status: string;
      volunteer: any;
      route: any;
      estimatedDistance: number;
      estimatedDuration: number;
      pickupScheduled: string;
      deliveryScheduled: string;
      donation: any;
      request: any;
      aiOptimized: boolean;
    };
  }>> {
    const response = await apiClient.get(`/ai-routing/status/${deliveryId}`);
    return response.data;
  }

  // AI-Powered Notification APIs
  async sendNotification(notificationData: {
    recipientId: string;
    event: string;
    context?: any;
    language?: string;
    channels?: string[];
    urgency?: string;
  }): Promise<ApiResponse<{
    notifications: Array<{
      id: string;
      channel: string;
      message: string;
      status: string;
      deliveredAt?: string;
    }>;
    aiGenerated: boolean;
    confidence?: number;
    reasoning?: string;
  }>> {
    console.log('🤖 Sending AI-powered notification');
    const response = await apiClient.post('/ai-notifications/send', notificationData);
    return response.data;
  }

  async sendWorkflowNotifications(workflowData: {
    event: string;
    stakeholders: Array<{
      userId: string;
      role: string;
      language?: string;
      channels?: string[];
      urgency?: string;
    }>;
    context?: any;
  }): Promise<ApiResponse<{
    totalRecipients: number;
    successful: number;
    failed: number;
    event: string;
    aiPowered: boolean;
  }>> {
    console.log('📢 Sending AI workflow notifications');
    const response = await apiClient.post('/ai-notifications/workflow', workflowData);
    return response.data;
  }

  async getUserNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    notifications: Array<{
      id: string;
      event_type: string;
      channel: string;
      language: string;
      subject?: string;
      message: string;
      ai_generated: boolean;
      ai_confidence?: number;
      status: string;
      created_at: string;
      delivered_at?: string;
    }>;
    count: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await apiClient.get(`/ai-notifications/user/${userId}?${params.toString()}`);
    return response.data;
  }
}

// Create and export API service instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  ApiResponse,
  User,
  Donation,
  Request,
  Volunteer,
  Match
};