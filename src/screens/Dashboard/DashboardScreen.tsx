import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

interface DashboardData {
  totalProperties: number;
  activeAlerts: number;
  avgSoilMoisture: number;
  weatherForecast: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recentAlerts: Array<{
    id: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProperties: 0,
    activeAlerts: 0,
    avgSoilMoisture: 0,
    weatherForecast: 'Carregando...',
    riskLevel: 'LOW',
    recentAlerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API service
      const data = await apiService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data if API fails
      setDashboardData({
        totalProperties: 5,
        activeAlerts: 2,
        avgSoilMoisture: 65,
        weatherForecast: 'Chuva moderada nas próximas 6h',
        riskLevel: 'MEDIUM',
        recentAlerts: [
          {
            id: '1',
            message: 'Umidade do solo baixa na Propriedade Norte',
            severity: 'HIGH',
            timestamp: '10 min atrás',
          },
          {
            id: '2',
            message: 'Previsão de chuva intensa detectada',
            severity: 'MEDIUM',
            timestamp: '25 min atrás',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'HIGH': return 'Alto Risco';
      case 'MEDIUM': return 'Risco Moderado';
      case 'LOW': return 'Baixo Risco';
      default: return 'Indefinido';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Olá, {user?.email?.split('@')[0] || 'Usuário'}!
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
          <Ionicons name="location-outline" size={24} color="#1976d2" />
          <Text style={styles.statNumber}>{dashboardData.totalProperties}</Text>
          <Text style={styles.statLabel}>Propriedades</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
          <Ionicons name="warning-outline" size={24} color="#f57c00" />
          <Text style={styles.statNumber}>{dashboardData.activeAlerts}</Text>
          <Text style={styles.statLabel}>Alertas Ativos</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#e8f5e8' }]}>
          <Ionicons name="water-outline" size={24} color="#2e7d32" />
          <Text style={styles.statNumber}>{dashboardData.avgSoilMoisture}%</Text>
          <Text style={styles.statLabel}>Umidade Média</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nível de Risco Atual</Text>
        <View style={[
          styles.riskCard, 
          { backgroundColor: getRiskColor(dashboardData.riskLevel) + '20' }
        ]}>
          <View style={styles.riskHeader}>
            <Ionicons 
              name="shield-outline" 
              size={28} 
              color={getRiskColor(dashboardData.riskLevel)} 
            />
            <Text style={[
              styles.riskLevel, 
              { color: getRiskColor(dashboardData.riskLevel) }
            ]}>
              {getRiskText(dashboardData.riskLevel)}
            </Text>
          </View>
          <Text style={styles.riskDescription}>
            Baseado na análise de umidade do solo, previsão meteorológica e dados históricos
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previsão do Tempo</Text>
        <View style={styles.weatherCard}>
          <Ionicons name="cloud-outline" size={32} color="#64b5f6" />
          <Text style={styles.weatherText}>{dashboardData.weatherForecast}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alertas Recentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.recentAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons 
                name="warning" 
                size={20} 
                color={alert.severity === 'HIGH' ? '#dc3545' : '#ffc107'} 
              />
              <Text style={styles.alertTime}>{alert.timestamp}</Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#2E8B57" />
            <Text style={styles.actionText}>Nova Propriedade</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics-outline" size={24} color="#2E8B57" />
            <Text style={styles.actionText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#2E8B57',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#e8f5e8',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#2E8B57',
    fontSize: 14,
    fontWeight: '500',
  },
  riskCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weatherText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});