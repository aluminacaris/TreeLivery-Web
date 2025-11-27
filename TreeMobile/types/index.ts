export interface Usuario {
  usuario_id: string;
  nome: string;
  email: string;
}

export interface Restaurante {
  restaurante_id: string;
  nome_fantasia: string;
  descricao?: string;
  avaliacao_media: number;
  tempo_medio_entrega?: number;
  foto_perfil?: string;
}

export interface Prato {
  prato_id: string;
  restaurante_id: string;
  nome: string;
  descricao?: string;
  preco: number;
  restricoes?: string[];
  disponivel: boolean;
  imagem_url?: string;
}

export interface ItemPedido {
  prato_id: string;
  quantidade: number;
  nome_prato: string;
  preco_unitario: number;
}

export interface Pedido {
  pedido_id: string;
  restaurante_id: string;
  data_pedido: string;
  status: string;
  total: number;
  itens: ItemPedido[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CartItem extends Prato {
  quantidade: number;
}