import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function MeusPedidos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [restaurantes, setRestaurantes] = useState({});
  const [avaliacoes, setAvaliacoes] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [avaliandoPedido, setAvaliandoPedido] = useState(null);
  const [formAvaliacao, setFormAvaliacao] = useState({ nota: 5, comentario: "" });

  useEffect(() => {
    if (usuario?.usuario_id) {
      carregarPedidos();
    }
  }, [usuario]);

  async function carregarPedidos() {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/pedidos/usuario/me`
      );
      setPedidos(response.data);
      
      // Carrega informações dos restaurantes
      const restaurantesMap = {};
      for (const pedido of response.data) {
        if (!restaurantesMap[pedido.restaurante_id]) {
          try {
            const restResponse = await axios.get(
              `http://localhost:8000/restaurantes/${pedido.restaurante_id}`
            );
            restaurantesMap[pedido.restaurante_id] = restResponse.data;
          } catch (err) {
            console.error("Erro ao carregar restaurante:", err);
          }
        }
      }
      setRestaurantes(restaurantesMap);
      
      // Carrega avaliações dos pedidos
      const avaliacoesMap = {};
      for (const pedido of response.data) {
        try {
          const avaliacaoResponse = await axios.get(
            `http://localhost:8000/avaliacoes/pedido/${pedido.pedido_id}`
          );
          avaliacoesMap[pedido.pedido_id] = avaliacaoResponse.data;
        } catch (err) {
          // Se não encontrar avaliação, não faz nada (pedido ainda não foi avaliado)
        }
      }
      setAvaliacoes(avaliacoesMap);
    } catch (err) {
      console.error("❌ Erro ao carregar pedidos:", err);
      error("Erro ao carregar pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function enviarAvaliacao(pedidoId) {
    try {
      await axios.post("http://localhost:8000/avaliacoes/", {
        pedido_id: pedidoId,
        nota: formAvaliacao.nota,
        comentario: formAvaliacao.comentario || null,
      });
      success("Avaliação enviada com sucesso!");
      setAvaliandoPedido(null);
      setFormAvaliacao({ nota: 5, comentario: "" });
      carregarPedidos(); // Recarrega para atualizar avaliações
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao enviar avaliação. Tente novamente.";
      error(errorMsg);
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
      p.pedido_id.toLowerCase().includes(busca.toLowerCase()) ||
      restaurantes[p.restaurante_id]?.nome_fantasia.toLowerCase().includes(busca.toLowerCase());
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
          <p className="text-primario font-semibold">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-primario mb-1">📦 Meus Pedidos</h2>
            <p className="text-gray-600 text-sm">
              {pedidos.length === 0 
                ? "Você ainda não fez nenhum pedido" 
                : `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} encontrado${pedidos.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={carregarPedidos}
              className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-secundario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
            >
              <span>🏠</span>
              <span>Explorar</span>
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar por ID do pedido ou restaurante..."
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
                ? "Você ainda não fez nenhum pedido." 
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
          {filtroStatus === "todos" && busca === "" && (
            <button
              onClick={() => navigate("/")}
              className="bg-primario text-white px-6 py-3 rounded-lg hover:bg-destaque transition font-medium mt-4"
            >
              🍴 Explorar Restaurantes
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido, index) => {
            const restaurante = restaurantes[pedido.restaurante_id];
            return (
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
                      {restaurante && (
                        <p className="text-sm text-gray-600 mb-1">
                          🍽️ <span className="font-medium">{restaurante.nome_fantasia}</span>
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

                  {/* Avaliação */}
                  {pedido.status === "Entregue" && (
                    <div className="pt-4 border-t border-gray-200">
                      {avaliacoes[pedido.pedido_id] ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-semibold text-green-800">
                              ⭐ {avaliacoes[pedido.pedido_id].nota}/5
                            </span>
                            <span className="text-sm text-gray-600">
                              Avaliado em {new Date(avaliacoes[pedido.pedido_id].criado_em).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {avaliacoes[pedido.pedido_id].comentario && (
                            <p className="text-sm text-gray-700 italic">
                              "{avaliacoes[pedido.pedido_id].comentario}"
                            </p>
                          )}
                        </div>
                      ) : avaliandoPedido === pedido.pedido_id ? (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                          <h5 className="font-semibold text-esc">Avaliar pedido</h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nota (1 a 5 estrelas)
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((nota) => (
                                <button
                                  key={nota}
                                  type="button"
                                  onClick={() => setFormAvaliacao({ ...formAvaliacao, nota })}
                                  className={`text-2xl transition ${
                                    formAvaliacao.nota >= nota
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ⭐
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comentário (opcional)
                            </label>
                            <textarea
                              value={formAvaliacao.comentario}
                              onChange={(e) =>
                                setFormAvaliacao({ ...formAvaliacao, comentario: e.target.value })
                              }
                              placeholder="Deixe um comentário sobre sua experiência..."
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
                              rows="3"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => enviarAvaliacao(pedido.pedido_id)}
                              className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium"
                            >
                              Enviar Avaliação
                            </button>
                            <button
                              onClick={() => {
                                setAvaliandoPedido(null);
                                setFormAvaliacao({ nota: 5, comentario: "" });
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAvaliandoPedido(pedido.pedido_id)}
                          className="w-full bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center justify-center gap-2"
                        >
                          <span>⭐</span>
                          <span>Avaliar Pedido</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

