from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import restaurantes, pedidos, usuarios, uploads, avaliacoes, cep
from .database import Base, engine
from .websocket_manager import manager
from .auth_restaurante import get_current_restaurante
from . import models
import asyncio

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
app.include_router(uploads.router)     #inclui as rotas de uploads
app.include_router(avaliacoes.router)  #inclui as rotas de avaliações
app.include_router(cep.router)         #inclui as rotas de CEP

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# WebSocket endpoint para notificações em tempo real
@app.websocket("/ws/restaurante/{restaurante_id}")
async def websocket_endpoint(websocket: WebSocket, restaurante_id: str):
    """Endpoint WebSocket para notificações do restaurante"""
    await manager.connect(websocket, restaurante_id)
    
    try:
        while True:
            try:
                # Aguarda mensagens do cliente (pode ser ping ou outras mensagens)
                # Usa timeout para não bloquear indefinidamente
                message = await asyncio.wait_for(websocket.receive(), timeout=60.0)
                
                # Processa mensagens de texto se necessário
                if "text" in message:
                    try:
                        data = message["text"]
                        # Se for um ping, responde com pong
                        if data == '{"type":"ping"}':
                            await websocket.send_text('{"type":"pong"}')
                    except Exception:
                        pass
                        
            except asyncio.TimeoutError:
                # Timeout é normal - cliente não enviou mensagem
                # Continua o loop para manter a conexão aberta
                continue
                
            except (WebSocketDisconnect, RuntimeError, ConnectionError) as e:
                # Cliente desconectou ou erro de conexão
                # Verifica se é erro de desconexão
                error_str = str(e).lower()
                if "disconnect" in error_str or "closed" in error_str or "connection" in error_str:
                    # Desconexão normal, apenas sai
                    break
                # Outros erros de runtime/connection
                raise
                
    except WebSocketDisconnect:
        # Conexão fechada normalmente pelo cliente
        pass
    except Exception as e:
        # Outros erros - verifica se é relacionado a desconexão
        error_str = str(e).lower()
        if "disconnect" not in error_str and "closed" not in error_str:
            # Apenas loga erros que não são de desconexão
            print(f"Erro no WebSocket: {type(e).__name__}: {e}")
    finally:
        # Sempre desconecta ao sair
        try:
            manager.disconnect(websocket, restaurante_id)
        except Exception:
            pass  # Ignora erros ao desconectar

# Cria tabelas no startup do app
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
