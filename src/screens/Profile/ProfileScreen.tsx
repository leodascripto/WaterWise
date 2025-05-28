import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  preferences: {
    language: string;
    theme: string;
    alertFrequency: string;
  };
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  });

  const loadProfile = async () => {
    try {
      const data = await apiService.getUserProfile();
      setProfile(data);
      setEditForm({
        name: data.name,
        phone: data.phone,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      await apiService.updateUserProfile(editForm);
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  };

  const updateNotificationSetting = async (key: keyof UserProfile['notifications'], value: boolean) => {
    if (!profile) return;
    
    try {
      const updatedProfile = {
        ...profile,
        notifications: {
          ...profile.notifications,
          [key]: value,
        },
      };
      await apiService.updateUserProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as configurações');
    }
  };

  const updatePreference = async (key: keyof UserProfile['preferences'], value: string) => {
    if (!profile) return;
    
    try {
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          [key]: value,
        },
      };
      await apiService.updateUserProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as preferências');
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#2E8B57" />
          </View>
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="pencil" size={16} color="#2E8B57" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => setEditModalVisible(true)}
        >
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{profile.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.infoItem}>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.infoItem}
          onPress={() => setEditModalVisible(true)}
        >
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Notificações Push</Text>
          </View>
          <Switch
            value={profile.notifications.push}
            onValueChange={(value) => updateNotificationSetting('push', value)}
            trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
            thumbColor={profile.notifications.push ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="mail" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Notificações por Email</Text>
          </View>
          <Switch
            value={profile.notifications.email}
            onValueChange={(value) => updateNotificationSetting('email', value)}
            trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
            thumbColor={profile.notifications.email ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="chatbubble" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Notificações por SMS</Text>
          </View>
          <Switch
            value={profile.notifications.sms}
            onValueChange={(value) => updateNotificationSetting('sms', value)}
            trackColor={{ false: '#e0e0e0', true: '#2E8B57' }}
            thumbColor={profile.notifications.sms ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências</Text>
        
        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.settingContent}>
            <Ionicons name="language" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Idioma</Text>
          </View>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceText}>Português (BR)</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.settingContent}>
            <Ionicons name="moon" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Tema</Text>
          </View>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceText}>Claro</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.settingContent}>
            <Ionicons name="timer" size={20} color="#2E8B57" />
            <Text style={styles.settingLabel}>Frequência de Alertas</Text>
          </View>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceText}>Imediato</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o App</Text>
        
        <TouchableOpacity style={styles.infoItem}>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem}>
          <Text style={styles.linkText}>Política de Privacidade</Text>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem}>
          <Text style={styles.linkText}>Termos de Uso</Text>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoItem}>
          <Text style={styles.linkText}>Suporte</Text>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#dc3545" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleUpdateProfile}>
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="Seu nome completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                placeholder="+55 11 99999-9999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2E8B57',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E8B57',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#e8f5e8',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoutText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
});