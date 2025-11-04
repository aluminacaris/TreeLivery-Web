from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+asyncpg://postgres:pedro@localhost:5432/treeliveryfr"

engine = create_async_engine(DATABASE_URL, echo=True, future=True) #conn async com o pgsql
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False) #sess do banco q permite operações async/await || tambem é oq cria sessoes individuais pro db 
Base = declarative_base() #base pros modelos sqlalchemy

async def get_db(): #get_db fornece sessao para cada request    
    async with AsyncSessionLocal() as session:
        yield session # padrão generator para dependency injection 
