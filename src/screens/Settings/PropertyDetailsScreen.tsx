import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { property } = route.params;
  
  const [sensorData, setSensorData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const loadData = async () => {
    try {
      const [sensors, weather] = await Promise.all([
        apiService.getSensorData(property.id, selectedTimeRange),
        apiService.getWeatherForecast(property.coordinates.latitude, property.coordinates.longitude),
      ]);
      setSensorData(sensors);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error loading property details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTimeRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#2E8B57',
    },
  };

  const timeRangeButtons = [
    { key: '1h', label: '1h' },
    { key: '6h', label: '6h' },
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>{property.name}</Text>
            <Text style={styles.propertyLocation}>{property.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddProperty', { property })}
          >
            <Ionicons name="pencil" size={20} color="#2E8B57" />
          </TouchableOpacity>
        </View>

        <View style={styles.propertyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.area} ha</Text>
            <Text style={styles.statLabel}>Área Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.soilMoisture}%</Text>
            <Text style={styles.statLabel}>Umidade do Solo</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(property.riskLevel) }
            ]}>
              <Text style={styles.riskText}>{getRiskText(property.riskLevel)}</Text>
            </View>
            <Text style={styles.statLabel}>Nível de Risco</Text>
          </View>
        </View>
      </View>

      {/* Weather Card */}
      {weatherData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Condições Meteorológicas</Text>
          <View style={styles.weatherContainer}>
            <View style={styles.currentWeather}>
              <Ionicons name="partly-sunny" size={32} color="#64b5f6" />
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weatherData.current.temperature}°C</Text>
                <Text style={styles.condition}>{weatherData.current.condition}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Ionicons name="water" size={16} color="#2196f3" />
                <Text style={styles.weatherDetailText}>{weatherData.current.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Ionicons name="speedometer" size={16} color="#9e9e9e" />
                <Text style={styles.weatherDetailText}>{weatherData.current.windSpeed} km/h</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Sensor Data Charts */}
      {sensorData && (
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Dados dos Sensores</Text>
            <View style={styles.timeRangeButtons}>
              {timeRangeButtons.map((button) => (
                <TouchableOpacity
                  key={button.key}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === button.key && styles.timeRangeButtonActive
                  ]}
                  onPress={() => setSelectedTimeRange(button.key)}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    selectedTimeRange === button.key && styles.timeRangeButtonTextActive
                  ]}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Soil Moisture Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Umidade do Solo (%)</Text>
            <LineChart
              data={{
                labels: sensorData.soilMoisture.slice(0, 6).map((_, i) => 
                  selectedTimeRange === '24h' ? `${i * 4}h` : `${i}h`
                ),
                datasets: [{
                  data: sensorData.soilMoisture.slice(0, 6).map(item => item.value),
                }],
              }}
              width={width - 60}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Temperature Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Temperatura (°C)</Text>
            <LineChart
              data={{
                labels: sensorData.temperature.slice(0, 6).map((_, i) => 
                  selectedTimeRange === '24h' ? `${i * 4}h` : `${i}h`
                ),
                datasets: [{
                  data: sensorData.temperature.slice(0, 6).map(item => item.value),
                }],
              }}
              width={width - 60}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Location Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Localização GPS</Text>
        <View style={styles.locationContainer}>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <Text style={styles.coordinateValue}>{property.coordinates.latitude}</Text>
          </View>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <Text style={styles.coordinateValue}>{property.coordinates.longitude}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map" size={20} color="#2E8B57" />
          <Text style={styles.mapButtonText}>Ver no Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Description Card */}
      {property.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descrição</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>
      )}

      {/* Last Update */}
      <View style={styles.lastUpdateContainer}>
        <Ionicons name="time" size={16} color="#999" />
        <Text style={styles.lastUpdateText}>
          Última atualização: {property.lastUpdate}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  riskText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 14,
    color: '#666',
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeButtons: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
    backgroundColor: '#f5f5f5',
  },
  timeRangeButtonActive: {
    backgroundColor: '#2E8B57',
  },
  timeRangeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  locationContainer: {
    marginBottom: 16,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordinateLabel: {
    fontSize: 16,
    color: '#666',
  },
  coordinateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '500',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  lastUpdateText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
});