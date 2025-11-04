from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, models, auth
from ..database import get_db
import sqlalchemy as sa

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.post("/", response_model=schemas.UsuarioOut)
async def criar_usuario(payload: schemas.UsuarioCreate, db: AsyncSession = Depends(get_db)):
    # Verifica se já existe o email
    result = await db.execute(sa.select(models.Usuario).where(models.Usuario.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = models.Usuario(
        nome=payload.nome,
        email=payload.email,
        senha_hash=auth.gerar_hash(payload.senha)
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario


@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    usuario = await auth.obter_usuario_por_email(db, form_data.username)
    if not usuario or not auth.verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    access_token = auth.criar_token({"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer"}
