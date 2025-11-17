# type: ignore
from typing import Dict, Set
from fastapi import WebSocket
import json

class ConnectionManager:
    """Gerenciador de conexões WebSocket"""
    
    def __init__(self):
        # Dicionário: restaurante_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, restaurante_id: str):
        """Conecta um WebSocket para um restaurante"""
        await websocket.accept()
        if restaurante_id not in self.active_connections:
            self.active_connections[restaurante_id] = set()
        self.active_connections[restaurante_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, restaurante_id: str):
        """Desconecta um WebSocket"""
        if restaurante_id in self.active_connections:
            self.active_connections[restaurante_id].discard(websocket)
            if not self.active_connections[restaurante_id]:
                del self.active_connections[restaurante_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Envia mensagem para um WebSocket específico"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Erro ao enviar mensagem: {e}")
    
    async def broadcast_to_restaurante(self, restaurante_id: str, message: dict):
        """Envia mensagem para todos os WebSockets de um restaurante"""
        if restaurante_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[restaurante_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Erro ao enviar para restaurante {restaurante_id}: {e}")
                    disconnected.add(connection)
            
            # Remove conexões desconectadas
            for conn in disconnected:
                self.active_connections[restaurante_id].discard(conn)
            
            if not self.active_connections[restaurante_id]:
                del self.active_connections[restaurante_id]

# Instância global do gerenciador
manager = ConnectionManager()

