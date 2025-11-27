import React from 'react';
import { CartProvider } from './context/CartContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App(): React.JSX.Element {
  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}