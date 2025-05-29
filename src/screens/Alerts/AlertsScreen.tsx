import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, Alert as AlertType } from '../../services/apiService';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const loadAlerts = async () => {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
      applyFilters(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (alertsData: AlertType[]) => {
    let filtered = [...alertsData];

    if (showUnreadOnly) {
      filtered = filtered.filter(alert => !alert.isRead);
    }

    if (selectedSeverity !== 'ALL') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredAlerts(filtered);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters(alerts);
  }, [showUnreadOnly, selectedSeverity, alerts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar o alerta como lido');
    }
  };

  const handleDeleteAlert = (alertId: string, message: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir este alerta?\n\n"${message.substring(0, 50)}..."`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAlert(alertId);
              setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o alerta');
            }
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'alert-circle';
      case 'LOW': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOIL_MOISTURE': return 'water';
      case 'WEATHER': return 'cloud';
      case 'FLOOD_RISK': return 'flash';
      case 'SYSTEM': return 'settings';
      default: return 'alert-circle';
    }
  };

  const severityOptions = [
    { key: 'ALL', label: 'Todos' },
    { key: 'HIGH', label: 'Alto' },
    { key: 'MEDIUM', label: 'Médio' },
    { key: 'LOW', label: 'Baixo' },
  ];

  const renderAlert = ({ item }: { item: AlertType }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
    >
      <LinearGradient
        colors={item.isRead ? ['#2D2D2D', '#3D3D3D'] : ['#3D3D3D', '#4D4D4D']}
        style={[
          styles.alertCardGradient,
          { borderLeftColor: getSeverityColor(item.severity) }
        ]}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertIcons}>
            <Ionicons 
              name={getTypeIcon(item.type)} 
              size={20} 
              color={getSeverityColor(item.severity)} 
            />
            <Ionicons 
              name={getSeverityIcon(item.severity)} 
              size={16} 
              color={getSeverityColor(item.severity)}
              style={styles.severityIcon}
            />
          </View>
          <View style={styles.alertActions}>
            {!item.isRead && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => handleMarkAsRead(item.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAlert(item.id, item.message)}
            >
              <Ionicons name="trash" size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertContent}>
          <Text style={styles.propertyName}>{item.propertyName}</Text>
          <Text style={[styles.alertMessage, !item.isRead && styles.alertMessageUnread]}>
            {item.message}
          </Text>
          <View style={styles.alertFooter}>
            <Text style={styles.alertTime}>{item.timestamp}</Text>
            {!item.isRead && <View style={styles.unreadIndicator} />}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color="#666" />
      <Text style={styles.emptyTitle}>Nenhum alerta encontrado</Text>
      <Text style={styles.emptySubtitle}>
        {showUnreadOnly 
          ? 'Todos os alertas foram lidos' 
          : 'O sistema está monitorando suas propriedades'
        }
      </Text>
    </View>
  );

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D']}
        style={styles.gradient}
      >
        {/* Header with filters */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#2D2D2D', '#3D3D3D']}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>
                Alertas {unreadCount > 0 && `(${unreadCount} não lidos)`}
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Ionicons name="refresh" size={20} color="#00FFCC" />
              </TouchableOpacity>
            </View>

            <View style={styles.filters}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Apenas não lidos</Text>
                <Switch
                  value={showUnreadOnly}
                  onValueChange={setShowUnreadOnly}
                  trackColor={{ false: '#3D3D3D', true: '#00FFCC' }}
                  thumbColor={showUnreadOnly ? '#FFFFFF' : '#CCCCCC'}
                />
              </View>

              <View style={styles.severityFilter}>
                {severityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.severityButton,
                      selectedSeverity === option.key && styles.severityButtonActive
                    ]}
                    onPress={() => setSelectedSeverity(option.key)}
                  >
                    <Text style={[
                      styles.severityButtonText,
                      selectedSeverity === option.key && styles.severityButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Alerts List */}
        <FlatList
          data={filteredAlerts}
          renderItem={renderAlert}
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
          ListEmptyComponent={renderEmptyState}
        />

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={async () => {
                try {
                  const unreadAlerts = alerts.filter(alert => !alert.isRead);
                  await Promise.all(
                    unreadAlerts.map(alert => apiService.markAlertAsRead(alert.id))
                  );
                  setAlerts(prev => 
                    prev.map(alert => ({ ...alert, isRead: true }))
                  );
                } catch (error) {
                  Alert.alert('Erro', 'Não foi possível marcar todos como lidos');
                }
              }}
            >
              <LinearGradient
                colors={['#00FFCC', '#00D4AA']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="checkmark-done" size={20} color="#1A1A1A" />
                <Text style={styles.quickActionText}>Marcar todos como lidos</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  headerGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  filters: {
    gap: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  severityFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#3D3D3D',
  },
  severityButtonActive: {
    backgroundColor: '#00FFCC',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  severityButtonTextActive: {
    color: '#1A1A1A',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertCardGradient: {
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    marginLeft: 8,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  markReadButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  alertContent: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFCC',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  alertMessageUnread: {
    fontWeight: '500',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFCC',
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
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  quickActionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  quickActionText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});