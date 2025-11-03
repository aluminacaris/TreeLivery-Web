import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from .database import Base
import uuid
from sqlalchemy.sql import func

class Usuario(Base):
    __tablename__ = "usuarios"
    usuario_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = sa.Column(sa.String(100), nullable=False)
    email = sa.Column(sa.String(255), nullable=False, unique=True)
    senha_hash = sa.Column(sa.String(255), nullable=False)
    telefone = sa.Column(sa.String(20))
    data_cadastro = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())
    ativo = sa.Column(sa.Boolean, default=True)

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

class Prato(Base):
    __tablename__ = "pratos"
    prato_id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurante_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("restaurantes.restaurante_id", ondelete="CASCADE"))
    nome = sa.Column(sa.String(100), nullable=False)
    descricao = sa.Column(sa.Text)
    preco = sa.Column(sa.Numeric(10,2), nullable=False)
    categoria = sa.Column(sa.String(50))
    disponivel = sa.Column(sa.Boolean, default=True)
    created_at = sa.Column(sa.TIMESTAMP(timezone=True), server_default=func.now())
