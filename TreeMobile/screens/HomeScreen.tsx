import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { restauranteService } from '../services/api';
import { Restaurante } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurantes = async () => {
    try {
      setRestaurantes(await restauranteService.getAll());
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadRestaurantes(); }, []);

  const renderRestaurante = ({ item }: { item: Restaurante }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Menu', { restaurante: item })}>
      <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>🍽️</Text></View>
      <View style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome_fantasia}</Text>
        {item.descricao && <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>}
        <View style={styles.infoRow}>
          <Text style={styles.avaliacao}>⭐ {item.avaliacao_media.toFixed(1)}</Text>
          {item.tempo_medio_entrega && <Text style={styles.tempo}>{item.tempo_medio_entrega} min</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌳 Restaurantes</Text>
      <FlatList data={restaurantes} renderItem={renderRestaurante} keyExtractor={(item) => item.restaurante_id} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRestaurantes(); }} />} ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Nenhum restaurante</Text></View>} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 50, color: '#2d5016' },
  list: { padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 48 },
  cardContent: { padding: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  descricao: { fontSize: 14, color: '#666', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  avaliacao: { fontSize: 14, color: '#FFA500', fontWeight: '600' },
  tempo: { fontSize: 14, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 50 },
});