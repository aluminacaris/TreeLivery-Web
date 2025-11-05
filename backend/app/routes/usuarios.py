#type: ignore
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, models, auth, crud
from ..auth import obter_usuario_atual
from ..database import get_db
import sqlalchemy as sa

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/", response_model=schemas.UsuarioOut)
async def criar_usuario(payload: schemas.UsuarioCreate, db: AsyncSession = Depends(get_db)):
    return await crud.criar_usuario(db, payload)

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    usuario = await auth.obter_usuario_por_email(db, form_data.username)
    if not usuario or not auth.verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    access_token = auth.criar_token({"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UsuarioOut)
async def get_usuario_atual(usuario: models.Usuario = Depends(obter_usuario_atual)):
    """
    Retorna os dados do usuário autenticado com base no token JWT.
    """
    return usuario
