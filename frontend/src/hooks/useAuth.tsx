import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { apiService, type User } from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (phone: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

interface RegisterData {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    user_type: 'donor' | 'ngo' | 'volunteer';
    organization_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth on mount
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (phone: string, password: string) => {
        setLoading(true);
        try {
            const response = await apiService.login({ phone, password });

            if (response.success && response.data) {
                const { user: userData, token: authToken } = response.data;

                setUser(userData);
                setToken(authToken);

                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setLoading(true);
        try {
            const response = await apiService.register(userData);

            if (response.success && response.data) {
                const { user: newUser, token: authToken } = response.data;

                setUser(newUser);
                setToken(authToken);

                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(newUser));
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user && !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}