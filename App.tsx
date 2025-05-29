import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

// Screens
import WelcomeScreen from './src/screens/Welcome/WelcomeScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterUserScreen from './src/screens/Auth/RegisterUserScreen';
import RegisterAddressScreen from './src/screens/Auth/RegisterAddressScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import PropertiesScreen from './src/screens/Properties/PropertiesScreen';
import AddPropertyScreen from './src/screens/Properties/AddPropertyScreen';
import PropertyDetailsScreen from './src/screens/Properties/PropertyDetailsScreen';
import AlertsScreen from './src/screens/Alerts/AlertsScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';

// Auth Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Properties') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00FFCC',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#2D2D2D',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Properties" 
        component={PropertiesScreen}
        options={{ title: 'Propriedades' }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{ title: 'Alertas' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A1A1A' }}>
        {/* Loading screen with proper background */}
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#00FFCC',
          background: '#1A1A1A',
          card: '#2D2D2D',
          text: '#FFFFFF',
          border: '#3D3D3D',
          notification: '#00FFCC',
        },
      }}
    >
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A1A' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="AddProperty" 
              component={AddPropertyScreen}
              options={{
                headerShown: true,
                title: 'Nova Propriedade',
                headerStyle: { backgroundColor: '#1A1A1A' },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen 
              name="PropertyDetails" 
              component={PropertyDetailsScreen}
              options={{
                headerShown: true,
                title: 'Detalhes da Propriedade',
                headerStyle: { backgroundColor: '#1A1A1A' },
                headerTintColor: '#FFFFFF',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterUserScreen} />
            <Stack.Screen name="RegisterAddress" component={RegisterAddressScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      {/* Status bar background fix for edge-to-edge */}
      <View style={{ flex: 0, backgroundColor: '#1A1A1A' }} />
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </>
  );
}