from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas
from ..database import get_db
from uuid import UUID

router = APIRouter(prefix="/restaurantes", tags=["restaurantes"])

@router.get("/", response_model=list[schemas.RestauranteOut])
async def list_restaurantes(db: AsyncSession = Depends(get_db)):
    rests = await crud.get_restaurants(db)
    return rests

@router.get("/{restaurante_id}", response_model=schemas.RestauranteOut)
async def get_restaurante(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    rest = await crud.get_restaurant(db, restaurante_id)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return rest

@router.get("/{restaurante_id}/menu", response_model=list[schemas.PratoOut])
async def menu(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    return await crud.get_menu(db, restaurante_id)

@router.post("/", response_model=schemas.RestauranteOut)
async def criar_restaurante(payload: schemas.RestauranteCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_restaurant(db, payload)
