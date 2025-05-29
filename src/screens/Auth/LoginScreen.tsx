import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // DEV LOGIN RÁPIDO
  const handleDevLogin = () => {
    setEmail('dev@waterwise.com');
    setPassword('123456');
    Alert.alert('Dev Login', 'Dados preenchidos automaticamente!');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled automatically by the auth state change
    } catch (error: any) {
      let message = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/user-not-found':
          message = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          message = 'Senha incorreta';
          break;
        case 'auth/too-many-requests':
          message = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/invalid-credential':
          message = 'Credenciais inválidas';
          break;
        default:
          message = error.message || 'Erro desconhecido';
      }
      
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperar Senha', 'Funcionalidade em desenvolvimento');
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo WaterWise */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="water" size={60} color="#00FFCC" />
              </View>
              <Text style={styles.title}>
                <Text style={styles.titleRegular}>W</Text>
                <Text style={styles.titleHighlight}>A</Text>
                <Text style={styles.titleRegular}>TERW</Text>
                <Text style={styles.titleHighlight}>I</Text>
                <Text style={styles.titleRegular}>SE</Text>
              </Text>
              <Text style={styles.subtitle}>Gestão Inteligente de Água</Text>
            </View>

            {/* Welcome Back */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
              <Text style={styles.welcomeSubtitle}>
                Entre na sua conta para continuar
              </Text>
            </View>

            {/* Dev Login Button */}
            <TouchableOpacity style={styles.devButton} onPress={handleDevLogin}>
              <Ionicons name="flash" size={16} color="#1A1A1A" />
              <Text style={styles.devButtonText}>Login Dev</Text>
            </TouchableOpacity>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#CCCCCC"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#CCCCCC"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#888888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#CCCCCC"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#00FFCC', '#00D4AA']}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#1A1A1A" />
                  ) : (
                    <Text style={styles.loginButtonText}>Entrar</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>
                  Não tem uma conta? <Text style={styles.registerHighlight}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Protegendo comunidades através da tecnologia
              </Text>
              <Text style={styles.footerSubtext}>
                Global Solution 2025 - FIAP
              </Text>
            </View>
          </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00FFCC',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  titleRegular: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  titleHighlight: {
    color: '#00FFCC',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFCC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
  },
  devButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#00FFCC',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3D3D3D',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#CCCCCC',
    fontSize: 14,
  },
  registerButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  registerHighlight: {
    color: '#00FFCC',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#888888',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default LoginScreen;