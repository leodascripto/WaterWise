import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = 'https://waterwise-api.azurewebsites.net/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = ''; // Get from secure storage in real app
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirect to login');
    }
    return Promise.reject(error);
  }
);

export interface Property {
  id: string;
  name: string;
  location: string;
  area: number;
  soilMoisture: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
}

export interface Alert {
  id: string;
  propertyId: string;
  propertyName: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  isRead: boolean;
  type: 'SOIL_MOISTURE' | 'WEATHER' | 'FLOOD_RISK' | 'SYSTEM';
}

export interface DashboardData {
  totalProperties: number;
  activeAlerts: number;
  avgSoilMoisture: number;
  weatherForecast: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recentAlerts: Alert[];
}

export interface CreatePropertyData {
  name: string;
  location: string;
  area: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
}

class ApiService {
  // Dashboard endpoints
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('API Error - getDashboardData:', error);
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          name: 'Fazenda São Pedro',
          location: 'Mairiporã, SP',
          area: 50.5,
          soilMoisture: 45,
          riskLevel: 'HIGH',
          lastUpdate: '2 min atrás',
          coordinates: { latitude: -23.3181, longitude: -46.5866 },
          description: 'Propriedade rural com foco em agricultura sustentável',
        },
        {
          id: '2',
          name: 'Sítio Verde Vale',
          location: 'Franco da Rocha, SP',
          area: 25.3,
          soilMoisture: 72,
          riskLevel: 'LOW',
          lastUpdate: '5 min atrás',
          coordinates: { latitude: -23.3295, longitude: -46.7267 },
          description: 'Propriedade com sistema de irrigação inteligente',
        },
        {
          id: '3',
          name: 'Chácara Bela Vista',
          location: 'Caieiras, SP',
          area: 18.7,
          soilMoisture: 58,
          riskLevel: 'MEDIUM',
          lastUpdate: '8 min atrás',
          coordinates: { latitude: -23.3618, longitude: -46.7418 },
          description: 'Pequena propriedade com cultivo orgânico',
        },
      ];
    }
  }

  async getProperty(id: string): Promise<Property> {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getProperty:', error);
      throw new Error('Não foi possível carregar os dados da propriedade');
    }
  }

  async createProperty(propertyData: CreatePropertyData): Promise<Property> {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('API Error - createProperty:', error);
      throw new Error('Não foi possível criar a propriedade');
    }
  }

  async updateProperty(id: string, propertyData: Partial<CreatePropertyData>): Promise<Property> {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error('API Error - updateProperty:', error);
      throw new Error('Não foi possível atualizar a propriedade');
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      await api.delete(`/properties/${id}`);
    } catch (error) {
      console.error('API Error - deleteProperty:', error);
      throw new Error('Não foi possível excluir a propriedade');
    }
  }

  // Alerts endpoints
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      console.error('API Error - getAlerts:', error);
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          propertyId: '1',
          propertyName: 'Fazenda São Pedro',
          message: 'Umidade do solo crítica: 15%. Risco de enchente detectado.',
          severity: 'HIGH',
          timestamp: '5 min atrás',
          isRead: false,
          type: 'SOIL_MOISTURE',
        },
        {
          id: '2',
          propertyId: '2',
          propertyName: 'Sítio Verde Vale',
          message: 'Previsão de chuva intensa para as próximas 2 horas.',
          severity: 'MEDIUM',
          timestamp: '15 min atrás',
          isRead: false,
          type: 'WEATHER',
        },
        {
          id: '3',
          propertyId: '3',
          propertyName: 'Chácara Bela Vista',
          message: 'Sistema de monitoramento funcionando normalmente.',
          severity: 'LOW',
          timestamp: '1 hora atrás',
          isRead: true,
          type: 'SYSTEM',
        },
        {
          id: '4',
          propertyId: '1',
          propertyName: 'Fazenda São Pedro',
          message: 'Algoritmo de IA detectou padrão de risco elevado.',
          severity: 'HIGH',
          timestamp: '2 horas atrás',
          isRead: false,
          type: 'FLOOD_RISK',
        },
      ];
    }
  }

  async markAlertAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/alerts/${id}/read`);
    } catch (error) {
      console.error('API Error - markAlertAsRead:', error);
      throw new Error('Não foi possível marcar o alerta como lido');
    }
  }

  async deleteAlert(id: string): Promise<void> {
    try {
      await api.delete(`/alerts/${id}`);
    } catch (error) {
      console.error('API Error - deleteAlert:', error);
      throw new Error('Não foi possível excluir o alerta');
    }
  }

  // Sensor data endpoints
  async getSensorData(propertyId: string, timeRange: '1h' | '6h' | '24h' | '7d' = '24h') {
    try {
      const response = await api.get(`/properties/${propertyId}/sensors?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getSensorData:', error);
      // Return mock data for demo purposes
      return {
        soilMoisture: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 30 + 40, // 40-70%
        })),
        temperature: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 10 + 20, // 20-30°C
        })),
        rainfall: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.random() * 5, // 0-5mm
        })),
      };
    }
  }

  // Weather endpoints
  async getWeatherForecast(latitude: number, longitude: number) {
    try {
      const response = await api.get(`/weather/forecast`, {
        params: { lat: latitude, lon: longitude },
      });
      return response.data;
    } catch (error) {
      console.error('API Error - getWeatherForecast:', error);
      // Return mock data for demo purposes
      return {
        current: {
          temperature: 25,
          humidity: 70,
          condition: 'Parcialmente nublado',
          windSpeed: 15,
        },
        forecast: Array.from({ length: 5 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          maxTemp: Math.random() * 5 + 25,
          minTemp: Math.random() * 5 + 18,
          condition: ['Ensolarado', 'Nublado', 'Chuvoso'][Math.floor(Math.random() * 3)],
          rainProbability: Math.random() * 100,
        })),
      };
    }
  }

  // User profile endpoints
  async getUserProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('API Error - getUserProfile:', error);
      // Return mock data for demo purposes
      return {
        id: '1',
        name: 'Usuário WaterWise',
        email: 'usuario@waterwise.com',
        phone: '+55 11 99999-9999',
        notifications: {
          push: true,
          email: true,
          sms: false,
        },
        preferences: {
          language: 'pt-BR',
          theme: 'light',
          alertFrequency: 'immediate',
        },
      };
    }
  }

  async updateUserProfile(profileData: any) {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('API Error - updateUserProfile:', error);
      throw new Error('Não foi possível atualizar o perfil');
    }
  }
}

export const apiService = new ApiService(); {
        totalProperties: 5,
        activeAlerts: 2,
        avgSoilMoisture: 65,
        weatherForecast: 'Chuva moderada nas próximas 6h',
        riskLevel: 'MEDIUM',
        recentAlerts: [
          {
            id: '1',
            propertyId: '1',
            propertyName: 'Fazenda São Pedro',
            message: 'Umidade do solo baixa detectada',
            severity: 'HIGH',
            timestamp: '10 min atrás',
            isRead: false,
            type: 'SOIL_MOISTURE',
          },
        ],
      };
    }
  }

  // Properties endpoints
  async getProperties(): Promise<Property[]> {
    try {
      const response = await api.get('/properties');
      return response.data;
    } catch (error) {
      console.error('API Error - getProperties:', error);
      // Return mock data for demo purposes
      return