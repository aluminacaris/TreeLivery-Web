from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from uuid import UUID
from decimal import Decimal
import re

class Endereco(BaseModel):
    cep: str
    logradouro: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    complemento: Optional[str]
    
    @field_validator('cep')
    @classmethod
    def validar_cep(cls, v):
        if v:
            # Remove caracteres não numéricos
            cep_limpo = re.sub(r'\D', '', v)
            if len(cep_limpo) != 8:
                raise ValueError('CEP deve conter 8 dígitos')
            # Formata CEP (12345-678)
            return f"{cep_limpo[:5]}-{cep_limpo[5:]}"
        return v
    
    @field_validator('estado')
    @classmethod
    def validar_estado(cls, v):
        if v:
            v_upper = v.upper().strip()
            estados_validos = [
                'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
            ]
            if v_upper not in estados_validos:
                raise ValueError('Estado deve ser uma sigla válida (ex: SP, RJ, MG)')
            return v_upper
        return v

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
    foto_perfil: Optional[str] = None

class RestauranteOut(BaseModel):
    restaurante_id: UUID
    nome_fantasia: str
    razao_social: str
    email: str
    descricao: Optional[str]
    telefone: Optional[str]
    tempo_medio_entrega: Optional[int]
    taxa_entrega_base: Optional[Decimal]
    avaliacao_media: Optional[Decimal] = 0.0
    ativo: bool
    endereco: Endereco
    foto_perfil: Optional[str] = None
    criado_em: datetime 
    
    class Config:
        from_attributes = True
                
class RestauranteUpdate(BaseModel):
    nome_fantasia: Optional[str] = None
    razao_social: Optional[str] = None
    descricao: Optional[str] = None
    telefone: Optional[str] = None
    tempo_medio_entrega: Optional[int] = None
    taxa_entrega_base: Optional[Decimal] = None
    endereco: Optional[Endereco] = None
    
    @field_validator('telefone')
    @classmethod
    def validar_telefone(cls, v):
        if v:
            # Remove caracteres não numéricos
            telefone_limpo = re.sub(r'\D', '', v)
            # Valida se tem 10 ou 11 dígitos (fixo ou celular)
            if len(telefone_limpo) < 10 or len(telefone_limpo) > 11:
                raise ValueError('Telefone deve conter 10 ou 11 dígitos')
            # Formata telefone: (11) 98765-4321 ou (11) 3456-7890
            if len(telefone_limpo) == 11:
                return f"({telefone_limpo[:2]}) {telefone_limpo[2:7]}-{telefone_limpo[7:]}"
            else:
                return f"({telefone_limpo[:2]}) {telefone_limpo[2:6]}-{telefone_limpo[6:]}"
        return v
    
    @field_validator('tempo_medio_entrega')
    @classmethod
    def validar_tempo_entrega(cls, v):
        if v is not None and (v < 1 or v > 300):
            raise ValueError('Tempo médio de entrega deve estar entre 1 e 300 minutos')
        return v
    
    @field_validator('taxa_entrega_base')
    @classmethod
    def validar_taxa_entrega(cls, v):
        if v is not None and v < 0:
            raise ValueError('Taxa de entrega não pode ser negativa')
        return v

class RestauranteLogin(BaseModel):
    email: str
    senha: str

class RestauranteAlterarSenha(BaseModel):
    senha_atual: str
    senha_nova: str
    
    @field_validator('senha_nova')
    @classmethod
    def validar_senha_nova(cls, v):
        if len(v) < 6:
            raise ValueError('A nova senha deve ter pelo menos 6 caracteres')
        return v

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
    nome_prato: str
    quantidade: int
    preco_unitario: Decimal
    
    class Config:
        orm_mode = True

class PedidoOut(BaseModel):
    pedido_id: UUID
    usuario_id: Optional[UUID]
    restaurante_id: UUID
    data_pedido: Any
    status: str
    total: Decimal
    itens: List[ItemPedidoOut]
    
    class Config:
        orm_mode = True

    
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

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    tipo_dieta: Optional[str] = None
    restricoes: Optional[List[str]] = None
    seletividade: Optional[bool] = None

class UsuarioAlterarSenha(BaseModel):
    senha_atual: str
    senha_nova: str
    
    @field_validator('senha_nova')
    @classmethod
    def validar_senha_nova(cls, v):
        if len(v) < 6:
            raise ValueError('A nova senha deve ter pelo menos 6 caracteres')
        return v

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

class AvaliacaoCreate(BaseModel):
    pedido_id: UUID
    nota: int  # 1 a 5
    comentario: Optional[str] = None

class AvaliacaoOut(BaseModel):
    avaliacao_id: UUID
    pedido_id: UUID
    restaurante_id: UUID
    usuario_id: UUID
    nota: int
    comentario: Optional[str]
    criado_em: datetime
    
    class Config:
        from_attributes = True
