import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { Restaurante } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Menu: { restaurante: Restaurante };
  Cart: { restauranteId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigator: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {!showRegister ? (
        <AuthStack.Screen name="Login">
          {() => <LoginScreen onLoginSuccess={onLoginSuccess} onNavigateToRegister={() => setShowRegister(true)} />}
        </AuthStack.Screen>
      ) : (
        <AuthStack.Screen name="Register">
          {() => <RegisterScreen onRegisterSuccess={() => setShowRegister(false)} onNavigateToLogin={() => setShowRegister(false)} />}
        </AuthStack.Screen>
      )}
    </AuthStack.Navigator>
  );
};

const MainTabs: React.FC = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#4CAF50', tabBarInactiveTintColor: '#666', headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
    <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Pedidos', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📦</Text> }} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">{() => <AuthNavigator onLoginSuccess={() => setIsAuthenticated(true)} />}</Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};