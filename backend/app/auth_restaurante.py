# app/auth_restaurante.py
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from .database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from . import models
import sqlalchemy as sa

SECRET_KEY = "troque_esta_chave_restaurante"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme_restaurante = OAuth2PasswordBearer(tokenUrl="/restaurantes/login")

def gerar_hash(senha: str):
    return pwd_context.hash(senha)

def verificar_senha(senha: str, hash: str):
    return pwd_context.verify(senha, hash)

def criar_token(dados: dict):
    to_encode = dados.copy()
    expira = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expira})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_restaurante(token: str = Depends(oauth2_scheme_restaurante), db: AsyncSession = Depends(get_db)):
    cred_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado.", headers={"WWW-Authenticate":"Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise cred_exception
    except JWTError:
        raise cred_exception
    result = await db.execute(sa.select(models.Restaurante).where(models.Restaurante.email == email))
    restaurante = result.scalar_one_or_none()
    if restaurante is None:
        raise cred_exception
    return restaurante
