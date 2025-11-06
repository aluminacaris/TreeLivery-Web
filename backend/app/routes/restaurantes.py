# type: ignore
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas, auth, crud, models
from ..database import get_db
from uuid import UUID
import sqlalchemy as sa
from datetime import datetime


router = APIRouter(prefix="/restaurantes", tags=["restaurantes"]) #todas as rotas começam com restaurantes
#tags ajudam na organização da documentação automática (Swagger UI) 

@router.get("/", response_model=list[schemas.RestauranteOut]) 
async def list_restaurantes(db: AsyncSession = Depends(get_db)):
    rests = await crud.get_restaurants(db)
    return rests

@router.get("/{restaurante_id}", response_model=schemas.RestauranteOut)
async def get_restaurante(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    rest = await crud.get_restaurant(db, restaurante_id) #busca no banco
    if not rest: #verifica se existe
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return rest #retorna, converte automaticamente para o schema RestauranteOut

@router.get("/{restaurante_id}/menu", response_model=list[schemas.PratoOut])
async def menu(restaurante_id: UUID, db: AsyncSession = Depends(get_db)):
    return await crud.get_menu(db, restaurante_id)

@router.post("/{restaurante_id}/menu", response_model=schemas.PratoOut)
async def criar_prato(restaurante_id: UUID, payload: schemas.PratoCreate, db: AsyncSession = Depends(get_db)):
    rest = await crud.get_restaurant(db, restaurante_id)
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")
    return await crud.create_prato(db, restaurante_id, payload)


#adicionar essa porra no crud depois #adicionei
@router.post("/registro", response_model=schemas.RestauranteOut)
async def registrar_restaurante(payload: schemas.RestauranteCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_restaurant(db, payload)

# 🟢 Novo: Login do restaurante
@router.post("/login", response_model=schemas.Token)
async def login_restaurante(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    restaurante = await crud.get_restaurant_by_email(db, form_data.username)
    
    if not restaurante or not auth.verificar_senha(form_data.password, restaurante.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    access_token = auth.criar_token({"sub": restaurante.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.RestauranteOut)
async def get_me(current_restaurante: models.Restaurante = Depends(auth.get_current_user_restaurante)):
    return current_restaurante