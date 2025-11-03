from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import restaurantes
from .database import Base, engine

app = FastAPI(title="iFood-Clone API")

# --- 🔧 Adicionando CORS ---
origins = [
    "http://localhost:5173",  # frontend local
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------

app.include_router(restaurantes.router)

# Cria tabelas no startup (apenas dev)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
