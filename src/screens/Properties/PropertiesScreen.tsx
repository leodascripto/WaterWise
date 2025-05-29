import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Properties: undefined;
  AddProperty: { property?: Property } | undefined;
  PropertyDetails: { property: Property };
};

type PropertiesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Properties'>;
import { apiService } from '../../services/apiService';

interface Property {
  id: string;
  name: string;
  location: string;
  area: number;
  soilMoisture: number;
  riskLevel: string;
  lastUpdate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function PropertiesScreen() {
  const navigation = useNavigation<PropertiesScreenNavigationProp>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadProperties = async () => {
    try {
      const data = await apiService.getProperties();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      // Mock data for demonstration
      const mockData: Property[] = [
        {
          id: '1',
          name: 'Fazenda São Pedro',
          location: 'Mairiporã, SP',
          area: 50.5,
          soilMoisture: 45,
          riskLevel: 'HIGH',
          lastUpdate: '2 min atrás',
          coordinates: { latitude: -23.3181, longitude: -46.5866 },
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
        },
      ];
      setProperties(mockData);
      setFilteredProperties(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = properties.filter(property =>
        property.name.toLowerCase().includes(searchText.toLowerCase()) ||
        property.location.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [searchText, properties]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleDeleteProperty = (id: string, name: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a propriedade "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteProperty(id);
              await loadProperties();
              Alert.alert('Sucesso', 'Propriedade excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a propriedade');
            }
          },
        },
      ]
    );
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
      case 'HIGH': return 'Alto';
      case 'MEDIUM': return 'Médio';
      case 'LOW': return 'Baixo';
      default: return 'N/A';
    }
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { property: item })}
    >
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.propertyCardGradient}
      >
        <View style={styles.propertyHeader}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>{item.name}</Text>
            <Text style={styles.propertyLocation}>{item.location}</Text>
          </View>
          <View style={styles.propertyActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddProperty', { property: item })}
            >
              <Ionicons name="pencil" size={18} color="#00FFCC" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProperty(item.id, item.name)}
            >
              <Ionicons name="trash" size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.propertyStats}>
          <View style={styles.statItem}>
            <Ionicons name="resize-outline" size={16} color="#CCCCCC" />
            <Text style={styles.statText}>{item.area} ha</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={16} color="#2196f3" />
            <Text style={styles.statText}>{item.soilMoisture}%</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(item.riskLevel) }
            ]}>
              <Text style={styles.riskText}>{getRiskText(item.riskLevel)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.propertyFooter}>
          <Text style={styles.lastUpdate}>Última atualização: {item.lastUpdate}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <LinearGradient
              colors={['#2D2D2D', '#3D3D3D']}
              style={styles.searchGradient}
            >
              <Ionicons name="search" size={20} color="#CCCCCC" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar propriedades..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#888888"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </View>

        <FlatList
          data={filteredProperties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#00FFCC"
              colors={['#00FFCC']}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>Nenhuma propriedade encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Tente uma busca diferente' : 'Adicione sua primeira propriedade'}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddProperty')}
        >
          <LinearGradient
            colors={['#00FFCC', '#00D4AA']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#1A1A1A" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  searchContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  propertyCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  propertyCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  propertyActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#888888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CCCCCC',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});