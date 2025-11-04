# type: ignore
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/pedidos", tags=["pedidos"]) #todas as rotas começam com pedidos

@router.post("/", response_model=schemas.PedidoOut)
async def criar_pedido(payload: schemas.PedidoCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_pedido(db, payload)