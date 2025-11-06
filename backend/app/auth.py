# type: ignore
from datetime import datetime, timedelta
from jose import JWTError, jwt #fwt = json web token
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, database
from .database import get_db
import sqlalchemy as sa

SECRET_KEY = "Sup3rS3gur0!@#"  # ⚠️ em produção, guarde isso em variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Para extrair o token do header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/usuarios/login")
oauth2_restaurante = OAuth2PasswordBearer(tokenUrl="/restaurantes/login")

def gerar_hash(senha: str) -> str:
    if not isinstance(senha, str):
        senha = str(senha)
    senha = senha.strip()[:72]  # remove espaços invisíveis e corta
    return pwd_context.hash(senha)

def verificar_senha(senha: str, senha_hash: str) -> bool:
    if not isinstance(senha, str):
        senha = str(senha)
    senha = senha.strip()[:72]
    return pwd_context.verify(senha, senha_hash)

def criar_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def obter_usuario_por_email(db: AsyncSession, email: str):
    result = await db.execute(sa.select(models.Usuario).where(models.Usuario.email == email))
    return result.scalar_one_or_none()

async def obter_usuario_atual(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(database.get_db),
):
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credenciais_invalidas
    except JWTError:
        raise credenciais_invalidas

    # busca o usuário no banco
    result = await db.execute(sa.select(models.Usuario).where(models.Usuario.email == email))
    usuario = result.scalar_one_or_none()
    if usuario is None:
        raise credenciais_invalidas
    return usuario

async def get_current_user_restaurante(
    token: str = Depends(oauth2_restaurante),
    db: AsyncSession = Depends(get_db)
):
    cred_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
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