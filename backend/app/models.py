# type: ignore
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from .database import Base
import uuid
from sqlalchemy.sql import func
from datetime import datetime, timezone

# type: ignore
class Restaurante(Base):
    __tablename__ = "restaurantes"
    restaurante_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome_fantasia = sa.Column(sa.String(100), nullable=False)
    razao_social = sa.Column(sa.String(100), nullable=False)
    descricao = sa.Column(sa.Text)
    telefone = sa.Column(sa.String(20))
    avaliacao_media = sa.Column(sa.Numeric(3,2), default=0.0)
    tempo_medio_entrega = sa.Column(sa.Integer)
    taxa_entrega_base = sa.Column(sa.Numeric(10,2), default=0)
    endereco = sa.Column(JSONB, nullable=False)
    ativo = sa.Column(sa.Boolean, default=True)

    email = sa.Column(sa.String, unique=True, nullable=False)
    senha_hash = sa.Column(sa.String, nullable=False)
    foto_perfil = sa.Column(sa.String, nullable=True)
    criado_em = sa.Column(sa.DateTime, default=func.now())
    

class Prato(Base):
    __tablename__ = "pratos"
    prato_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurante_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("restaurantes.restaurante_id", ondelete="CASCADE"))
    nome = sa.Column(sa.String(100), nullable=False)
    descricao = sa.Column(sa.Text)
    preco = sa.Column(sa.Numeric(10,2), nullable=False)
    restricoes = sa.Column(sa.ARRAY(sa.String), nullable=True)   
    disponivel = sa.Column(sa.Boolean, default=True)
    imagem_url = sa.Column(sa.String, nullable=True)
    created_at = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())

# relacionamento 1--n com itemPedido
class Pedido(Base):
    __tablename__ = "pedidos"
    pedido_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("usuarios.usuario_id"), nullable=True)             
    restaurante_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("restaurantes.restaurante_id"))
    data_pedido = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())
    status = sa.Column(sa.String(30), default="Recebido")  # Pode ser: Recebido, Em preparo, Entregue
    total = sa.Column(sa.Numeric(10, 2), nullable=False)
    itens = sa.orm.relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")


class ItemPedido(Base):
    __tablename__ = "itens_pedido"
    item_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("pedidos.pedido_id", ondelete="CASCADE"))
    prato_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("pratos.prato_id"))
    quantidade = sa.Column(sa.Integer, nullable=False)
    nome_prato = sa.Column(sa.String(100), nullable=False)
    preco_unitario = sa.Column(sa.Numeric(10, 2), nullable=False)

    pedido = sa.orm.relationship("Pedido", back_populates="itens")

class Usuario(Base):
    __tablename__ = "usuarios"

    usuario_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = sa.Column(sa.String(100), nullable=False)
    email = sa.Column(sa.String(120), unique=True, nullable=False)
    senha_hash = sa.Column(sa.String(255), nullable=False)
    criado_em = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())
    tipo_dieta = sa.Column(sa.String(50), nullable=True)  # Ex: vegetariano, vegano, etc.
    restricoes = sa.Column(sa.ARRAY(sa.String), nullable=True)  # Ex: ["gluten", "lactose"]
    seletividade = sa.Column(sa.Boolean, default=False)  # Indica se o usuário é seletivo com alimentos
    pedidos = sa.orm.relationship("Pedido", backref="usuario")

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    
    avaliacao_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("pedidos.pedido_id", ondelete="CASCADE"), nullable=False)
    restaurante_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("restaurantes.restaurante_id"), nullable=False)
    usuario_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("usuarios.usuario_id"), nullable=False)
    nota = sa.Column(sa.Integer, nullable=False)  # 1 a 5
    comentario = sa.Column(sa.Text, nullable=True)
    criado_em = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())
    
    # Garantir que um usuário só pode avaliar um pedido uma vez
    __table_args__ = (sa.UniqueConstraint('pedido_id', 'usuario_id', name='uq_avaliacao_pedido_usuario'),)
