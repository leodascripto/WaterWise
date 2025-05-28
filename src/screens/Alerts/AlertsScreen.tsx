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
      style={[
        styles.alertCard,
        !item.isRead && styles.alertCardUnread,
        { borderLeftColor: getSeverityColor(item.severity) }
      ]}
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
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
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color="#ccc" />
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
      {/* Header with filters */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            Alertas {unreadCount > 0 && `(${unreadCount} não lidos)`}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#2E8B57" />
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Apenas não lidos</Text>
            <Switch
              value={showUnreadOnly}
              onValueChange={setShowUnreadOnly}
              trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
              thumbColor={showUnreadOnly ? '#fff' : '#f4f3f4'}
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
      </View>

      {/* Alerts List */}
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Marcar todos como lidos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    color: '#333',
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
    color: '#333',
  },
  severityFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  severityButtonActive: {
    backgroundColor: '#2E8B57',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  severityButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertCardUnread: {
    backgroundColor: '#fefefe',
    elevation: 3,
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
    color: '#2E8B57',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
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
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E8B57',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8B57',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});