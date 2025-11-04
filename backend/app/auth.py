
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, database
import sqlalchemy as sa

SECRET_KEY = "supersegredo123"  # ⚠️ em produção, guarde isso em variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


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

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def obter_usuario_por_email(db: AsyncSession, email: str):
    result = await db.execute(sa.select(models.Usuario).where(models.Usuario.email == email))
    return result.scalar_one_or_none()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await obter_usuario_por_email(db, email)
    if user is None:
        raise credentials_exception
    return user