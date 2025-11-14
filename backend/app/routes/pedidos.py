# type: ignore
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, models
from ..database import get_db
from ..auth import obter_usuario_atual
from ..auth_restaurante import get_current_restaurante
from uuid import UUID

router = APIRouter(prefix="/pedidos", tags=["pedidos"]) #todas as rotas começam com pedidos

@router.post("/", response_model=schemas.PedidoOut)
async def criar_pedido(
    payload: schemas.PedidoCreate, 
    db: AsyncSession = Depends(get_db),
    usuario: models.Usuario = Depends(obter_usuario_atual)
):
    """Cria um novo pedido associado ao usuário logado"""
    return await crud.create_pedido(db, payload, usuario.usuario_id)

@router.get("/restaurante/{restaurante_id}", response_model=list[schemas.PedidoOut])
async def listar_pedidos_restaurante(
    restaurante_id: UUID, 
    db: AsyncSession = Depends(get_db),
    restaurante: models.Restaurante = Depends(get_current_restaurante)
):
    """Lista pedidos de um restaurante (apenas o próprio restaurante pode ver seus pedidos)"""
    # Valida que o restaurante só vê seus próprios pedidos
    if restaurante.restaurante_id != restaurante_id:
        raise HTTPException(status_code=403, detail="Você só pode ver os pedidos do seu próprio restaurante")
    return await crud.get_pedidos_restaurante(db, restaurante_id)

@router.get("/usuario/me", response_model=list[schemas.PedidoOut])
async def listar_pedidos_usuario(
    db: AsyncSession = Depends(get_db),
    usuario: models.Usuario = Depends(obter_usuario_atual)
):
    """Lista pedidos do usuário logado"""
    return await crud.get_pedidos_usuario(db, usuario.usuario_id)

@router.put("/{pedido_id}/status")
async def atualizar_status(
    pedido_id: UUID, 
    status: str, 
    db: AsyncSession = Depends(get_db),
    restaurante: models.Restaurante = Depends(get_current_restaurante)
):
    """Atualiza o status de um pedido (apenas o restaurante dono do pedido pode atualizar)"""
    pedido = await crud.update_pedido_status(db, pedido_id, status, restaurante.restaurante_id)

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado ou você não tem permissão para atualizá-lo")

    return {"message": "Status atualizado com sucesso"}
