import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function PedidosRestaurante() {
  const { restaurante } = useAuthRestaurante();
  const { success, error } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (restaurante?.restaurante_id) {
      carregarPedidos();
    }
  }, [restaurante]);

  async function carregarPedidos() {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/pedidos/restaurante/${restaurante.restaurante_id}`
      );
      setPedidos(response.data);
      
      // Carrega informações dos usuários
      const usuariosMap = {};
      for (const pedido of response.data) {
        if (pedido.usuario_id && !usuariosMap[pedido.usuario_id]) {
          try {
            // Nota: precisaríamos de uma rota para buscar usuário por ID
            // Por enquanto, vamos apenas armazenar o ID
            usuariosMap[pedido.usuario_id] = { usuario_id: pedido.usuario_id };
          } catch (err) {
            console.error("Erro ao carregar usuário:", err);
          }
        }
      }
      setUsuarios(usuariosMap);
    } catch (err) {
      console.error("❌ Erro ao carregar pedidos:", err);
      error("Erro ao carregar pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(pedidoId, novoStatus) {
    try {
      await axios.put(`http://localhost:8000/pedidos/${pedidoId}/status?status=${novoStatus}`);
      success("Status atualizado com sucesso!");
      carregarPedidos(); // Recarrega a lista
    } catch (err) {
      console.error("❌ Erro ao atualizar status:", err);
      error("Erro ao atualizar status. Tente novamente.");
    }
  }

  const statusValidos = ["Recebido", "Em preparo", "Saiu para entrega", "Entregue", "Cancelado"];
  
  const getStatusIcon = (status) => {
    const icons = {
      "Recebido": "📥",
      "Em preparo": "👨‍🍳",
      "Saiu para entrega": "🚴",
      "Entregue": "✅",
      "Cancelado": "❌",
    };
    return icons[status] || "📦";
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    const matchBusca = busca === "" || 
      p.pedido_id.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const getStatusColor = (status) => {
    const cores = {
      "Recebido": "bg-blue-100 text-blue-800 border-blue-300",
      "Em preparo": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Saiu para entrega": "bg-purple-100 text-purple-800 border-purple-300",
      "Entregue": "bg-green-100 text-green-800 border-green-300",
      "Cancelado": "bg-red-100 text-red-800 border-red-300",
    };
    return cores[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatarData = (data) => {
    if (!data) return "Data não disponível";
    const date = new Date(data);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-primario mb-1">📦 Gerenciar Pedidos</h2>
            <p className="text-gray-600 text-sm">
              {pedidos.length === 0 
                ? "Nenhum pedido encontrado" 
                : `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} encontrado${pedidos.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={carregarPedidos}
            className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Atualizar</span>
          </button>
        </div>

        {/* Busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar por ID do pedido..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-2 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus("todos")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroStatus === "todos"
                ? "bg-primario text-white shadow-md"
                : "bg-white text-texto border border-secundario hover:bg-secundario/10"
            }`}
          >
            Todos ({pedidos.length})
          </button>
          {statusValidos.map((status) => {
            const count = pedidos.filter((p) => p.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filtroStatus === status
                    ? "bg-primario text-white shadow-md"
                    : "bg-white text-texto border border-secundario hover:bg-secundario/10"
                }`}
              >
                <span>{getStatusIcon(status)}</span>
                <span>{status} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-12 text-center"
        >
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg mb-2 font-medium">
            {busca !== "" 
              ? "Nenhum pedido encontrado com essa busca." 
              : filtroStatus === "todos" 
                ? "Nenhum pedido encontrado." 
                : `Nenhum pedido com status "${filtroStatus}".`}
          </p>
          {busca !== "" && (
            <button
              onClick={() => setBusca("")}
              className="text-primario hover:underline mt-2"
            >
              Limpar busca
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido, index) => (
            <motion.div
              key={pedido.pedido_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                {/* Cabeçalho do pedido */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-esc">
                        Pedido #{pedido.pedido_id.slice(0, 8).toUpperCase()}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          pedido.status
                        )}`}
                      >
                        {getStatusIcon(pedido.status)} {pedido.status}
                      </span>
                    </div>
                    {pedido.usuario_id && (
                      <p className="text-sm text-gray-600 mb-1">
                        👤 Cliente ID: {pedido.usuario_id.slice(0, 8).toUpperCase()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      📅 {formatarData(pedido.data_pedido)}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold text-primario">
                      R$ {Number(pedido.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {pedido.itens?.length || 0} item{pedido.itens?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Itens do pedido */}
                <div className="mb-4">
                  <h4 className="font-semibold text-esc mb-3 flex items-center gap-2">
                    <span>📋</span>
                    <span>Itens do pedido</span>
                  </h4>
                  <ul className="space-y-2">
                    {pedido.itens?.map((item) => (
                      <li
                        key={item.item_id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-texto">{item.nome_prato}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            × {item.quantidade}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-primario font-semibold">
                            R$ {Number(item.preco_unitario * item.quantidade).toFixed(2)}
                          </span>
                          <p className="text-xs text-gray-500">
                            R$ {Number(item.preco_unitario).toFixed(2)} cada
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ações - Atualizar status */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600 self-center">
                    Atualizar status:
                  </span>
                  {statusValidos.map((status) => (
                    <button
                      key={status}
                      onClick={() => atualizarStatus(pedido.pedido_id, status)}
                      disabled={pedido.status === status}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                        pedido.status === status
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-secundario/20 text-secundario hover:bg-secundario/30"
                      }`}
                    >
                      <span>{getStatusIcon(status)}</span>
                      <span>{status}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

