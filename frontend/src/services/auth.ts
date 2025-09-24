import { apiService } from './api';
import type { User } from './api';

// Authentication state management
class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private token: string | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Load auth data from localStorage on initialization
    this.loadAuthData();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load auth data from localStorage
  private loadAuthData(): void {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      this.clearAuthData();
    }
  }

  // Save auth data to localStorage
  private saveAuthData(user: User, token: string): void {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.user = user;
      this.token = token;
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  // Clear auth data
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.user = null;
    this.token = null;
    this.notifyListeners();
  }

  // Notify listeners of auth state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user));
  }

  // Subscribe to auth state changes
  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.user && this.token);
  }

  // Check if user is verified
  isVerified(): boolean {
    return this.user?.is_verified ?? false;
  }

  // Register new user
  async register(userData: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    user_type: 'donor' | 'ngo' | 'volunteer';
    organization_name?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.register(userData);

      if (response.success) {
        this.saveAuthData(response.data.user, response.data.token);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: {
    phone: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.login(credentials);

      if (response.success) {
        this.saveAuthData(response.data.user, response.data.token);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  }

  // Verify phone number
  async verifyPhone(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.verifyPhone({ phone, otp });

      if (response.success && this.user) {
        // Update current user's verification status
        const updatedUser = { ...this.user, is_verified: true };
        this.saveAuthData(updatedUser, this.token!);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Verification failed' };
      }
    } catch (error: any) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Verification failed'
      };
    }
  }

  // Send OTP
  async sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.sendOTP(phone);
      return { success: response.success };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send OTP'
      };
    }
  }

  // Update profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiService.updateProfile(updates);

      if (response.success) {
        this.saveAuthData(response.data, this.token!);
        return { success: true, user: response.data };
      } else {
        return { success: false, error: response.error || 'Profile update failed' };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  }

  // Logout user
  logout(): void {
    this.clearAuthData();
    // Optionally redirect to login page
    window.location.href = '/';
  }

  // Refresh user profile from server
  async refreshProfile(): Promise<void> {
    try {
      if (!this.isAuthenticated()) return;

      const response = await apiService.getProfile();
      if (response.success) {
        this.saveAuthData(response.data, this.token!);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // If token is invalid, logout user
      if (error && (error as any).response?.status === 401) {
        this.logout();
      }
    }
  }
}

// Create and export singleton instance
export const authService = AuthService.getInstance();

// Export AuthService class for type checking
export { AuthService };

// Custom hook for using auth state in React components
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setUser);
    return unsubscribe;
  }, []);

  const login = async (credentials: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    user_type: 'donor' | 'ngo' | 'volunteer';
    organization_name?: string;
  }) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
  };

  const verifyPhone = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const result = await authService.verifyPhone(phone, otp);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    const result = await authService.sendOTP(phone);
    return result;
  };

  return {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    isVerified: authService.isVerified(),
    login,
    register,
    logout,
    verifyPhone,
    sendOTP,
  };
}