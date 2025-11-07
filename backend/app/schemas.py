from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
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
    email: str
    senha: str
    descricao: Optional[str]
    telefone: Optional[str]
    tempo_medio_entrega: Optional[int]
    taxa_entrega_base: Optional[Decimal]
    endereco: Endereco

class RestauranteOut(BaseModel):
    restaurante_id: UUID
    nome_fantasia: str
    razao_social: str
    email: str
    descricao: Optional[str]
    telefone: Optional[str]
    tempo_medio_entrega: Optional[int]
    taxa_entrega_base: Optional[Decimal]
    ativo: bool
    endereco: Endereco  
    criado_em: datetime 
    
    class Config:
        from_attributes = True
                
class RestauranteLogin(BaseModel):
    email: str
    senha: str

class PratoCreate(BaseModel):
    nome: str
    descricao: Optional[str]
    preco: Decimal
    restricoes: list[str] = []
    imagem_url: Optional[str] = None
    
class PratoOut(PratoCreate):
    prato_id: UUID
    restaurante_id: UUID
    disponivel: bool

class ItemPedidoCreate(BaseModel):
    prato_id: UUID
    quantidade: int 
    
class PedidoCreate(BaseModel):
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
    
class UsuarioBase(BaseModel):
    nome: str
    email: str
    tipo_dieta: Optional[str] = None
    restricoes: Optional[List[str]] = None
    seletividade: Optional[bool] = False

class UsuarioCreate(UsuarioBase):
    nome: str   
    email: str
    senha: str
    tipo_dieta: Optional[str] = None
    restricoes: Optional[List[str]] = None
    seletividade: Optional[bool] = False

class UsuarioOut(UsuarioBase):
    usuario_id: UUID
    nome: str
    email: EmailStr
    criado_em: datetime
    tipo_dieta: Optional[str]
    restricoes: Optional[List[str]]
    seletividade: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
