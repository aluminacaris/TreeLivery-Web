import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { restauranteService } from '../services/api';
import { useCart } from '../context/CartContext';
import { Prato } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MenuRouteProp = RouteProp<RootStackParamList, 'Menu'>;

export const MenuScreen: React.FC = () => {
  const route = useRoute<MenuRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { restaurante } = route.params;
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemCount } = useCart();

  useEffect(() => {
    restauranteService.getPratos(restaurante.restaurante_id).then((data) => {
      setPratos(data.filter((p) => p.disponivel));
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (prato: Prato) => { addItem(prato); Alert.alert('✓', `${prato.nome} adicionado!`); };

  const renderPrato = ({ item }: { item: Prato }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome}</Text>
        {item.descricao && <Text style={styles.descricao}>{item.descricao}</Text>}
        <View style={styles.footer}>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 24 }}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{restaurante.nome_fantasia}</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart', { restauranteId: restaurante.restaurante_id })}>
          <Text style={styles.cartButtonText}>🛒 {getItemCount()}</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={pratos} renderItem={renderPrato} keyExtractor={(item) => item.prato_id} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Nenhum prato</Text></View>} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2d5016' },
  cartButton: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  cartButtonText: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardContent: { padding: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  descricao: { fontSize: 14, color: '#666', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  preco: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  addButton: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 50 },
});