import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { pedidoService } from '../services/api';

export const CartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restauranteId } = route.params;
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) { Alert.alert('Erro', 'Carrinho vazio'); return; }
    setLoading(true);
    try {
      const itensPedido = items.map((item) => ({ prato_id: item.prato_id, quantidade: item.quantidade, nome_prato: item.nome, preco_unitario: item.preco }));
      await pedidoService.create(restauranteId, itensPedido);
      clearCart();
      Alert.alert('Sucesso', 'Pedido realizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar pedido');
    } finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.prato_id, item.quantidade - 1)}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
        <Text style={styles.quantity}>{item.quantidade}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.prato_id, item.quantidade + 1)}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.prato_id)}><Text style={styles.removeButtonText}>🗑️</Text></TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) return <View style={styles.center}><Text style={styles.emptyText}>Carrinho vazio</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 24 }}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Carrinho</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.prato_id} contentContainerStyle={styles.list} />
      <View style={styles.footer}>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total:</Text><Text style={styles.totalValue}>R$ {getTotal().toFixed(2)}</Text></View>
        <TouchableOpacity style={[styles.orderButton, loading && styles.buttonDisabled]} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderButtonText}>Finalizar Pedido</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2d5016' },
  list: { padding: 10, paddingBottom: 150 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 2 },
  itemInfo: { marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPrice: { fontSize: 14, color: '#666' },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#4CAF50', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantity: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 15, minWidth: 30, textAlign: 'center' },
  removeButton: { marginLeft: 'auto', padding: 5 },
  removeButtonText: { fontSize: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#ddd' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  orderButton: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  orderButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});