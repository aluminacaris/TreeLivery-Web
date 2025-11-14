# type: ignore
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, models
from ..database import get_db
from ..auth import obter_usuario_atual
from uuid import UUID

router = APIRouter(prefix="/avaliacoes", tags=["avaliacoes"])

@router.post("/", response_model=schemas.AvaliacaoOut)
async def criar_avaliacao(
    payload: schemas.AvaliacaoCreate,
    db: AsyncSession = Depends(get_db),
    usuario: models.Usuario = Depends(obter_usuario_atual)
):
    """Cria uma avaliação para um pedido"""
    return await crud.criar_avaliacao(db, payload, usuario.usuario_id)

@router.get("/restaurante/{restaurante_id}", response_model=list[schemas.AvaliacaoOut])
async def listar_avaliacoes_restaurante(
    restaurante_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Lista todas as avaliações de um restaurante"""
    return await crud.get_avaliacoes_restaurante(db, restaurante_id)

@router.get("/pedido/{pedido_id}", response_model=schemas.AvaliacaoOut)
async def get_avaliacao_pedido(
    pedido_id: UUID,
    db: AsyncSession = Depends(get_db),
    usuario: models.Usuario = Depends(obter_usuario_atual)
):
    """Busca a avaliação de um pedido específico do usuário logado"""
    avaliacao = await crud.get_avaliacao_pedido(db, pedido_id, usuario.usuario_id)
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return avaliacao

