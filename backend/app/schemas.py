from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from decimal import Decimal

class Endereco(BaseModel):
    cep: str
    logradouro: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    complemento: Optional[str]

class RestauranteCreate(BaseModel):
    nome_fantasia: str
    razao_social: str
    descricao: Optional[str]
    telefone: Optional[str]
    tempo_medio_entrega: Optional[int]
    taxa_entrega_base: Optional[Decimal]
    endereco: Endereco

class RestauranteOut(RestauranteCreate):
    restaurante_id: UUID
    avaliacao_media: Optional[Decimal]
    ativo: bool

class PratoCreate(BaseModel):
    nome: str
    descricao: Optional[str]
    preco: Decimal
    categoria: Optional[str]

class PratoOut(PratoCreate):
    prato_id: UUID
    restaurante_id: UUID
    disponivel: bool

class ItemPedidoCreate(BaseModel):
    prato_id: UUID
    quantidade: int 
    
class PedidoCreate(BaseModel):
    usuario_id: Optional[UUID]
    restaurante_id: UUID
    itens: List[ItemPedidoCreate]
    
class ItemPedidoOut(ItemPedidoCreate):
    item_id: UUID
    pedido_id: UUID
    preco_unitario: Decimal

class PedidoOut(BaseModel):
    pedido_id: UUID
    usuario_id: Optional[UUID]
    restaurante_id: UUID
    data_pedido: Any
    status: str
    total: Decimal
    itens: List[ItemPedidoOut]