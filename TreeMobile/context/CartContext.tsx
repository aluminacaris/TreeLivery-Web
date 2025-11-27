import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Prato } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (prato: Prato) => void;
  removeItem: (pratoId: string) => void;
  updateQuantity: (pratoId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (prato: Prato) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.prato_id === prato.prato_id);
      if (existing) {
        return prev.map((item) =>
          item.prato_id === prato.prato_id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...prato, quantidade: 1 }];
    });
  };

  const removeItem = (pratoId: string) => {
    setItems((prev) => prev.filter((item) => item.prato_id !== pratoId));
  };

  const updateQuantity = (pratoId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(pratoId); return; }
    setItems((prev) => prev.map((item) => (item.prato_id === pratoId ? { ...item, quantidade: quantity } : item)));
  };

  const clearCart = () => setItems([]);
  const getTotal = () => items.reduce((total, item) => total + item.preco * item.quantidade, 0);
  const getItemCount = () => items.reduce((count, item) => count + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};