import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/apiService';

interface PropertyForm {
  name: string;
  location: string;
  area: string;
  latitude: string;
  longitude: string;
  description: string;
}

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const existingProperty = route.params?.property;
  const isEditing = !!existingProperty;

  const [form, setForm] = useState<PropertyForm>({
    name: '',
    location: '',
    area: '',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PropertyForm>>({});

  useEffect(() => {
    if (existingProperty) {
      setForm({
        name: existingProperty.name,
        location: existingProperty.location,
        area: existingProperty.area.toString(),
        latitude: existingProperty.coordinates.latitude.toString(),
        longitude: existingProperty.coordinates.longitude.toString(),
        description: existingProperty.description || '',
      });
    }
  }, [existingProperty]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PropertyForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!form.location.trim()) {
      newErrors.location = 'Localização é obrigatória';
    }

    if (!form.area.trim()) {
      newErrors.area = 'Área é obrigatória';
    } else if (isNaN(parseFloat(form.area)) || parseFloat(form.area) <= 0) {
      newErrors.area = 'Área deve ser um número positivo';
    }

    if (!form.latitude.trim()) {
      newErrors.latitude = 'Latitude é obrigatória';
    } else if (isNaN(parseFloat(form.latitude))) {
      newErrors.latitude = 'Latitude deve ser um número válido';
    }

    if (!form.longitude.trim()) {
      newErrors.longitude = 'Longitude é obrigatória';
    } else if (isNaN(parseFloat(form.longitude))) {
      newErrors.longitude = 'Longitude deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        name: form.name.trim(),
        location: form.location.trim(),
        area: parseFloat(form.area),
        coordinates: {
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        },
        description: form.description.trim(),
      };

      if (isEditing) {
        await apiService.updateProperty(existingProperty.id, propertyData);
        Alert.alert('Sucesso', 'Propriedade atualizada com sucesso!');
      } else {
        await apiService.createProperty(propertyData);
        Alert.alert('Sucesso', 'Propriedade criada com sucesso!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving property:', error);
      Alert.alert('Erro', 'Não foi possível salvar a propriedade');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof PropertyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getCurrentLocation = () => {
    // In a real app, you would use expo-location here
    Alert.alert(
      'Localização Atual',
      'Esta funcionalidade obteria sua localização atual via GPS',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular',
          onPress: () => {
            updateForm('latitude', '-23.3181');
            updateForm('longitude', '-46.5866');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Propriedade *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={form.name}
              onChangeText={(text) => updateForm('name', text)}
              placeholder="Ex: Fazenda São Pedro"
              placeholderTextColor="#999"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localização *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              value={form.location}
              onChangeText={(text) => updateForm('location', text)}
              placeholder="Ex: Mairiporã, SP"
              placeholderTextColor="#999"
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área (hectares) *</Text>
            <TextInput
              style={[styles.input, errors.area && styles.inputError]}
              value={form.area}
              onChangeText={(text) => updateForm('area', text)}
              placeholder="Ex: 50.5"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
          </View>

          <View style={styles.coordinatesSection}>
            <View style={styles.coordinatesHeader}>
              <Text style={styles.sectionTitle}>Coordenadas GPS</Text>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={getCurrentLocation}
              >
                <Ionicons name="location" size={16} color="#2E8B57" />
                <Text style={styles.locationButtonText}>Usar localização atual</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coordinatesRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Latitude *</Text>
                <TextInput
                  style={[styles.input, errors.latitude && styles.inputError]}
                  value={form.latitude}
                  onChangeText={(text) => updateForm('latitude', text)}
                  placeholder="-23.3181"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Longitude *</Text>
                <TextInput
                  style={[styles.input, errors.longitude && styles.inputError]}
                  value={form.longitude}
                  onChangeText={(text) => updateForm('longitude', text)}
                  placeholder="-46.5866"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(text) => updateForm('description', text)}
              placeholder="Adicione informações adicionais sobre a propriedade..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2196f3" />
            <Text style={styles.infoText}>
              As coordenadas GPS são essenciais para o monitoramento preciso dos sensores IoT
              e análise de dados meteorológicos da região.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Propriedade'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  coordinatesSection: {
    marginBottom: 20,
  },
  coordinatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#2E8B57',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  coordinatesRow: {
    flexDirection: 'row',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});