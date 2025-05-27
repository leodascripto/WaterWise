import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  status: string;
  last_login?: string;
}

interface Property {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  area_total?: number;
  usuario_id: number;
}

interface AuthContextType {
  user: User | null;
  property: Property | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any, propertyData: any) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const propertyData = await AsyncStorage.getItem('property');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (propertyData) {
        setProperty(JSON.parse(propertyData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call - Replace with actual API call
      const response = await fetch('YOUR_API_ENDPOINT/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: userData, property: propertyData } = await response.json();
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('property', JSON.stringify(propertyData));
        
        setUser(userData);
        setProperty(propertyData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, propertyData: any): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call - Replace with actual API call
      const response = await fetch('YOUR_API_ENDPOINT/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userData, property: propertyData }),
      });

      if (response.ok) {
        const { user: newUser, property: newProperty } = await response.json();
        
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        await AsyncStorage.setItem('property', JSON.stringify(newProperty));
        
        setUser(newUser);
        setProperty(newProperty);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('property');
      setUser(null);
      setProperty(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    property,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};