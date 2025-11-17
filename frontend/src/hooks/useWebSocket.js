import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!url) {
      setIsConnected(false);
      return;
    }

    // Fecha conexão anterior se existir
    if (ws.current) {
      try {
        ws.current.close(1000, 'Nova conexão sendo estabelecida');
      } catch (e) {
        // Ignora erros ao fechar
      }
      ws.current = null;
    }

    const connect = () => {
      // Evita múltiplas conexões
      if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
        return;
      }

      try {
        // Converte http:// para ws:// ou https:// para wss://
        const wsUrl = url.replace(/^http/, 'ws');
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('WebSocket conectado');
          setIsConnected(true);
          reconnectAttempts.current = 0;
          
          // Envia um ping periódico para manter a conexão viva
          const pingInterval = setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              try {
                ws.current.send(JSON.stringify({ type: 'ping' }));
              } catch (error) {
                console.error('Erro ao enviar ping:', error);
                clearInterval(pingInterval);
              }
            } else {
              clearInterval(pingInterval);
            }
          }, 30000); // Ping a cada 30 segundos
          
          // Armazena o intervalo para limpar depois
          ws.current._pingInterval = pingInterval;
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Ignora mensagens de pong (resposta ao ping)
            if (data.type === 'pong') {
              return;
            }
            if (onMessage) {
              onMessage(data);
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        ws.current.onerror = (error) => {
          console.error('Erro no WebSocket:', error);
        };

        ws.current.onclose = (event) => {
          console.log('WebSocket desconectado', event.code, event.reason);
          setIsConnected(false);
          
          // Limpa o intervalo de ping
          if (ws.current && ws.current._pingInterval) {
            clearInterval(ws.current._pingInterval);
          }
          
          // Não tenta reconectar se foi fechado intencionalmente (código 1000)
          if (event.code === 1000) {
            console.log('Conexão fechada intencionalmente');
            return;
          }
          
          // Tenta reconectar apenas se não foi fechado intencionalmente
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`Tentando reconectar (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
              connect();
            }, delay);
          } else {
            console.error('Máximo de tentativas de reconexão atingido');
          }
        };
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error);
      }
    };

    connect();

    return () => {
      // Cancela tentativas de reconexão
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Fecha conexão WebSocket
      if (ws.current) {
        // Limpa o intervalo de ping
        if (ws.current._pingInterval) {
          clearInterval(ws.current._pingInterval);
        }
        
        // Remove event listeners para evitar vazamentos
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        
        // Fecha a conexão
        if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
          try {
            ws.current.close(1000, 'Componente desmontado');
          } catch (e) {
            // Ignora erros ao fechar
          }
        }
        
        ws.current = null;
      }
      
      setIsConnected(false);
    };
  }, [url, onMessage]);

  return { isConnected, ws: ws.current };
}

