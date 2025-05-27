import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, property, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    waterUsage: 0,
    savings: 0,
    efficiency: 0,
    alerts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulate API call - Replace with actual API call
    try {
      // Mock data for demonstration
      setDashboardData({
        waterUsage: 2847,
        savings: 1250,
        efficiency: 87,
        alerts: 2,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const StatCard = ({ icon, title, value, unit, color }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const QuickActionCard = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.actionCardGradient}
      >
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.nome?.split(' ')[0] || 'Usuário'}</Text>
            <Text style={styles.propertyName}>{property?.nome}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FFCC"
              colors={['#00FFCC']}
            />
          }
        >
          {/* Water Usage Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visão Geral</Text>
            <View style={styles.statsContainer}>
              <StatCard
                icon="water-outline"
                title="Uso de Água"
                value={dashboardData.waterUsage}
                unit="L hoje"
                color="#00FFCC"
              />
              <StatCard
                icon="trending-down-outline"
                title="Economia"
                value={dashboardData.savings}
                unit="L este mês"
                color="#4CAF50"
              />
            </View>
            <View style={styles.statsContainer}>
              <StatCard
                icon="speedometer-outline"
                title="Eficiência"
                value={dashboardData.efficiency}
                unit="% média"
                color="#FF9800"
              />
              <StatCard
                icon="alert-circle-outline"
                title="Alertas"
                value={dashboardData.alerts}
                unit="ativos"
                color="#F44336"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <QuickActionCard
              icon="analytics-outline"
              title="Relatórios Detalhados"
              onPress={() => {}}
              color="#00FFCC"
            />
            <QuickActionCard
              icon="notifications-outline"
              title="Configurar Alertas"
              onPress={() => {}}
              color="#FF9800"
            />
            <QuickActionCard
              icon="map-outline"
              title="Monitorar Áreas"
              onPress={() => {}}
              color="#2196F3"
            />
            <QuickActionCard
              icon="leaf-outline"
              title="Dicas de Sustentabilidade"
              onPress={() => {}}
              color="#4CAF50"
            />
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.activityCardGradient}
              >
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Sistema de irrigação otimizado</Text>
                    <Text style={styles.activityTime}>Há 2 horas</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="alert-circle" size={20} color="#FF9800" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Vazamento detectado no setor B</Text>
                    <Text style={styles.activityTime}>Há 5 horas</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="trending-up" size={20} color="#00FFCC" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Economia de 15% no consumo</Text>
                    <Text style={styles.activityTime}>Ontem</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Weather Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condições Climáticas</Text>
            <View style={styles.weatherCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.weatherCardGradient}
              >
                <View style={styles.weatherMain}>
                  <Ionicons name="partly-sunny" size={48} color="#FFB74D" />
                  <View style={styles.weatherInfo}>
                    <Text style={styles.temperature}>24°C</Text>
                    <Text style={styles.weatherDescription}>Parcialmente nublado</Text>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="rainy" size={16} color="#00FFCC" />
                    <Text style={styles.weatherDetailText}>Chuva: 0%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water" size={16} color="#2196F3" />
                    <Text style={styles.weatherDetailText}>Umidade: 65%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="arrow-up" size={16} color="#FF5722" />
                    <Text style={styles.weatherDetailText}>Vento: 12 km/h</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  propertyName: {
    color: '#00FFCC',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  statCardHeader: {
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statUnit: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
  },
  statTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },
  weatherCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  weatherCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 16,
  },
  temperature: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  weatherDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
});

export default DashboardScreen;