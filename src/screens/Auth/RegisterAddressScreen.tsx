import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterAddressScreenProps {
  navigation: any;
  route: any;
}

const RegisterAddressScreen: React.FC<RegisterAddressScreenProps> = ({ navigation, route }) => {
  const { userData } = route.params;
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [propertyData, setPropertyData] = useState({
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    area_total: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { nome, endereco, cidade, estado, cep } = propertyData;

    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome da propriedade é obrigatório');
      return false;
    }

    if (!endereco.trim()) {
      Alert.alert('Erro', 'Endereço é obrigatório');
      return false;
    }

    if (!cidade.trim()) {
      Alert.alert('Erro', 'Cidade é obrigatória');
      return false;
    }

    if (!estado.trim()) {
      Alert.alert('Erro', 'Estado é obrigatório');
      return false;
    }

    if (!cep.trim()) {
      Alert.alert('Erro', 'CEP é obrigatório');
      return false;
    }

    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(cep)) {
      Alert.alert('Erro', 'CEP deve ter o formato 00000-000');
      return false;
    }

    return true;
  };

  const formatCEP = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    return formatted;
  };

  const handleCEPChange = (text: string) => {
    const formatted = formatCEP(text);
    handleInputChange('cep', formatted);
  };

  const handleFinish = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await register(userData, {
        ...propertyData,
        area_total: propertyData.area_total ? parseFloat(propertyData.area_total) : null,
      });

      if (success) {
        Alert.alert(
          'Sucesso!',
          'Conta criada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha ao criar conta. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Conta</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Passo 2 de 2</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Dados da Propriedade</Text>
              <Text style={styles.subtitle}>Agora nos conte sobre sua propriedade rural</Text>

              {/* Nome da Propriedade */}
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome da propriedade"
                  placeholderTextColor="#888888"
                  value={propertyData.nome}
                  onChangeText={(value) => handleInputChange('nome', value)}
                  autoCapitalize="words"
                />
              </View>

              {/* Endereço */}
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Endereço completo"
                  placeholderTextColor="#888888"
                  value={propertyData.endereco}
                  onChangeText={(value) => handleInputChange('endereco', value)}
                  autoCapitalize="words"
                />
              </View>

              {/* Cidade e Estado */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.flexInput]}>
                  <Ionicons name="business-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Cidade"
                    placeholderTextColor="#888888"
                    value={propertyData.cidade}
                    onChangeText={(value) => handleInputChange('cidade', value)}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.stateInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Estado"
                    placeholderTextColor="#888888"
                    value={propertyData.estado}
                    onChangeText={(value) => handleInputChange('estado', value)}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              </View>

              {/* CEP */}
              <View style={styles.inputContainer}>
                <Ionicons name="map-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="CEP (00000-000)"
                  placeholderTextColor="#888888"
                  value={propertyData.cep}
                  onChangeText={handleCEPChange}
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>

              {/* Área Total */}
              <View style={styles.inputContainer}>
                <Ionicons name="resize-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Área total (hectares) - Opcional"
                  placeholderTextColor="#888888"
                  value={propertyData.area_total}
                  onChangeText={(value) => handleInputChange('area_total', value)}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Info Box */}
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#00FFCC" />
                <Text style={styles.infoText}>
                  Estes dados nos ajudam a personalizar as funcionalidades do app para sua propriedade.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Finish Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={handleFinish} 
              style={styles.finishButton}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#00FFCC', '#00D4AA']}
                style={styles.finishButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1A1A1A" size="small" />
                ) : (
                  <>
                    <Text style={styles.finishButtonText}>Finalizar Cadastro</Text>
                    <Ionicons name="checkmark" size={20} color="#1A1A1A" style={styles.finishButtonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3D3D3D',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFCC',
    borderRadius: 2,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  flexInput: {
    flex: 1,
  },
  stateInput: {
    width: 100,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.2)',
    marginTop: 16,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  finishButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  finishButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  finishButtonIcon: {
    marginLeft: 8,
  },
});

export default RegisterAddressScreen;