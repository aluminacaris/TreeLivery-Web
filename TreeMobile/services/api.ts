import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, Restaurante, Prato, Pedido, TokenResponse, ItemPedido } from '../types';

const API_BASE_URL = 'http://SEU_IP:8000';

const MOCK_RESTAURANTES: Restaurante[] = [
  { restaurante_id: '1', nome_fantasia: 'Pizzaria Bella', descricao: 'As melhores pizzas da cidade', avaliacao_media: 4.5, tempo_medio_entrega: 30 },
  { restaurante_id: '2', nome_fantasia: 'Sushi House', descricao: 'Comida japonesa autêntica', avaliacao_media: 4.8, tempo_medio_entrega: 45 },
];

const MOCK_PRATOS: Record<string, Prato[]> = {
  '1': [
    { prato_id: '101', restaurante_id: '1', nome: 'Pizza Margherita', descricao: 'Molho, mussarela e manjericão', preco: 45.90, disponivel: true },
    { prato_id: '102', restaurante_id: '1', nome: 'Pizza Calabresa', descricao: 'Calabresa e cebola', preco: 42.90, disponivel: true },
  ],
  '2': [
    { prato_id: '201', restaurante_id: '2', nome: 'Combo Sushi', descricao: '20 peças variadas', preco: 89.90, disponivel: true },
    { prato_id: '202', restaurante_id: '2', nome: 'Temaki Salmão', descricao: 'Salmão fresco', preco: 32.90, disponivel: true },
  ],
};

const MOCK_USER = { email: 'teste@teste.com', password: '123456' };
const USE_MOCK = true;

export const authService = {
  async login(email: string, password: string): Promise<TokenResponse> {
    if (USE_MOCK) {
      if (email === MOCK_USER.email && password === MOCK_USER.password) {
        await AsyncStorage.setItem('token', 'mock-token');
        return { access_token: 'mock-token', token_type: 'bearer' };
      }
      throw new Error('Credenciais inválidas');
    }
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await response.json();
    if (data.access_token) await AsyncStorage.setItem('token', data.access_token);
    return data;
  },

  async register(nome: string, email: string, senha: string): Promise<Usuario> {
    if (USE_MOCK) return { usuario_id: '1', nome, email };
    const response = await fetch(`${API_BASE_URL}/usuarios/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    return response.json();
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },
};

export const restauranteService = {
  async getAll(): Promise<Restaurante[]> {
    if (USE_MOCK) return MOCK_RESTAURANTES;
    const response = await fetch(`${API_BASE_URL}/restaurantes/`);
    return response.json();
  },

  async getPratos(restauranteId: string): Promise<Prato[]> {
    if (USE_MOCK) return MOCK_PRATOS[restauranteId] || [];
    const response = await fetch(`${API_BASE_URL}/restaurantes/${restauranteId}/pratos`);
    return response.json();
  },
};

export const pedidoService = {
  async create(restauranteId: string, itens: ItemPedido[]): Promise<Pedido> {
    if (USE_MOCK) {
      return {
        pedido_id: Date.now().toString(),
        restaurante_id: restauranteId,
        status: 'Recebido',
        data_pedido: new Date().toISOString(),
        itens,
        total: itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0),
      };
    }
    const token = await AsyncStorage.getItem('token');
    const total = itens.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0);
    const response = await fetch(`${API_BASE_URL}/pedidos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ restaurante_id: restauranteId, itens, total }),
    });
    return response.json();
  },

  async getMyPedidos(): Promise<Pedido[]> {
    if (USE_MOCK) return [];
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/pedidos/meus-pedidos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};