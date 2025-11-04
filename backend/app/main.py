from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import restaurantes, pedidos, usuarios
from .database import Base, engine

app = FastAPI(title="TreeLivery API")

# --- 🔧 Adicionando CORS ---
# CORS permite o acesso do FrontEnd ao BackEnd, FastAPI nativamente bloqueia isso por segurança
origins = [
    "http://localhost:5173",  # frontend local
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, #permite todas as origens listadas
    allow_credentials=True,
    allow_methods=["*"], #permite todos os métodos (GET, POST, etc) HTTP
    allow_headers=["*"],
)
# ----------------------------

app.include_router(restaurantes.router) #inclui as rotas de restaurantes
app.include_router(pedidos.router)       #inclui as rotas de pedidos    
app.include_router(usuarios.router)     #inclui as rotas de usuários    

# Cria tabelas no startup do app
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
