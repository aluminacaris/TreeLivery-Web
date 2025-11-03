from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas
from uuid import UUID

async def get_restaurants(db: AsyncSession, limit: int = 50):
    q = await db.execute(select(models.Restaurante).where(models.Restaurante.ativo==True).limit(limit))
    return q.scalars().all()

async def get_restaurant(db: AsyncSession, restaurante_id: UUID):
    q = await db.execute(select(models.Restaurante).where(models.Restaurante.restaurante_id==restaurante_id))
    return q.scalar_one_or_none()

async def create_restaurant(db: AsyncSession, rest: schemas.RestauranteCreate):
    obj = models.Restaurante(
        nome_fantasia=rest.nome_fantasia,
        razao_social=rest.razao_social,
        descricao=rest.descricao,
        telefone=rest.telefone,
        tempo_medio_entrega=rest.tempo_medio_entrega,
        taxa_entrega_base=rest.taxa_entrega_base,
        endereco=rest.endereco.dict()
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def get_menu(db: AsyncSession, restaurante_id: UUID):
    q = await db.execute(select(models.Prato).where(models.Prato.restaurante_id==restaurante_id, models.Prato.disponivel==True))
    return q.scalars().all()

async def get_prato(db: AsyncSession, prato_id: UUID):
    q = await db.execute(select(models.Prato).where(models.Prato.prato_id==prato_id))
    return q.scalar_one_or_none()
