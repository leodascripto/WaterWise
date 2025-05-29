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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

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

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D']}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#2D2D2D', '#3D3D3D']}
              style={styles.headerGradient}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#00FFCC" />
                </View>
                <TouchableOpacity 
                  style={styles.editAvatarButton}
                  onPress={() => setEditModalVisible(true)}
                >
                  <Ionicons name="pencil" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userEmail}>{profile.email}</Text>
            </LinearGradient>
          </View>

          {/* Profile Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.infoCardGradient}
              >
                <TouchableOpacity 
                  style={styles.infoItem}
                  onPress={() => setEditModalVisible(true)}
                >
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Nome</Text>
                    <Text style={styles.infoValue}>{profile.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
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
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            
            <View style={styles.settingsCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.settingsCardGradient}
              >
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Ionicons name="notifications" size={20} color="#00FFCC" />
                    <Text style={styles.settingLabel}>Notificações Push</Text>
                  </View>
                  <Switch
                    value={profile.notifications.push}
                    onValueChange={(value) => updateNotificationSetting('push', value)}
                    trackColor={{ false: '#3D3D3D', true: '#00FFCC' }}
                    thumbColor={profile.notifications.push ? '#FFFFFF' : '#CCCCCC'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Ionicons name="mail" size={20} color="#00FFCC" />
                    <Text style={styles.settingLabel}>Notificações por Email</Text>
                  </View>
                  <Switch
                    value={profile.notifications.email}
                    onValueChange={(value) => updateNotificationSetting('email', value)}
                    trackColor={{ false: '#3D3D3D', true: '#00FFCC' }}
                    thumbColor={profile.notifications.email ? '#FFFFFF' : '#CCCCCC'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Ionicons name="chatbubble" size={20} color="#00FFCC" />
                    <Text style={styles.settingLabel}>Notificações por SMS</Text>
                  </View>
                  <Switch
                    value={profile.notifications.sms}
                    onValueChange={(value) => updateNotificationSetting('sms', value)}
                    trackColor={{ false: '#3D3D3D', true: '#00FFCC' }}
                    thumbColor={profile.notifications.sms ? '#FFFFFF' : '#CCCCCC'}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o App</Text>
            
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.infoCardGradient}
              >
                <View style={styles.infoItem}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Versão</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.infoItem}>
                  <Text style={styles.linkText}>Política de Privacidade</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoItem}>
                  <Text style={styles.linkText}>Termos de Uso</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoItem}>
                  <Text style={styles.linkText}>Suporte</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={['#dc3545', '#c82333']}
                style={styles.logoutButtonGradient}
              >
                <Ionicons name="log-out" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1A1A1A', '#2D2D2D']}
              style={styles.modalGradient}
            >
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
                    placeholderTextColor="#888888"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                    placeholder="+55 11 99999-9999"
                    placeholderTextColor="#888888"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FFCC',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FFCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCardGradient: {
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 16,
    color: '#00FFCC',
    fontWeight: '500',
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsCardGradient: {
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  logoutSection: {
    margin: 16,
    marginBottom: 40,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#00FFCC',
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
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
});