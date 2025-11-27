import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { pedidoService } from '../services/api';
import { Pedido } from '../types';

export const OrdersScreen: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPedidos = async () => {
    try { setPedidos(await pedidoService.getMyPedidos()); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadPedidos(); }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Recebido': return '#FFA500';
      case 'Em preparo': return '#2196F3';
      case 'Entregue': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pedidoId}>Pedido #{item.pedido_id.slice(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.items}>
        {item.itens.map((i, idx) => <Text key={idx} style={styles.itemText}>{i.quantidade}x {i.nome_prato}</Text>)}
      </View>
      <View style={styles.totalRow}><Text style={styles.totalLabel}>Total:</Text><Text style={styles.totalValue}>R$ {item.total.toFixed(2)}</Text></View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Meus Pedidos</Text>
      <FlatList data={pedidos} renderItem={renderPedido} keyExtractor={(item) => item.pedido_id} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPedidos(); }} />} ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Nenhum pedido ainda</Text></View>} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 50, color: '#2d5016' },
  list: { padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pedidoId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  items: { marginBottom: 10 },
  itemText: { fontSize: 14, color: '#666', marginBottom: 5 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 50 },
});