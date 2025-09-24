// Types for the Jonoshongjog relief distribution platform

export interface User {
  id: string;
  name: string;
  role: 'donor' | 'ngo' | 'volunteer';
  phone: string;
  email?: string;
  location: Location;
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  district: string;
  division: string;
}

export interface DonationItem {
  id: string;
  donorId: string;
  category: 'food' | 'clothes' | 'medicine' | 'blankets' | 'other';
  name: string;
  quantity: number;
  unit: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high';
  expiryDate?: Date;
  pickupLocation: Location;
  status: 'available' | 'matched' | 'in_transit' | 'delivered';
  createdAt: Date;
}

export interface ReliefRequest {
  id: string;
  ngoId: string;
  category: 'food' | 'clothes' | 'medicine' | 'blankets' | 'other';
  itemName: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  beneficiaries: number;
  description: string;
  deliveryLocation: Location;
  status: 'pending' | 'matched' | 'in_transit' | 'fulfilled';
  deadline?: Date;
  createdAt: Date;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  donationId: string;
  requestId: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  assignedAt: Date;
  completedAt?: Date;
  route?: RoutePoint[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  address: string;
  type: 'pickup' | 'delivery';
  estimatedTime: Date;
}

export interface DeliveryConfirmation {
  id: string;
  assignmentId: string;
  photo?: string;
  recipientName: string;
  recipientPhone: string;
  notes?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  language: 'bn' | 'en';
  type: 'text';
  timestamp: Date;
  response?: string;
}