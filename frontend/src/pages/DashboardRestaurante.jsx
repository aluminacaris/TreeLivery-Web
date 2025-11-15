import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function DashboardRestaurante() {
  const { restaurante, loading: loadingRestaurante } = useAuthRestaurante();
  const { error } = useToast();
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurante) {
      carregarEstatisticas();
    }
  }, [restaurante]);

  async function carregarEstatisticas() {
    try {
      setLoading(true);
      const token = localStorage.getItem("restaurante_token");
      const response = await axios.get(
        "http://localhost:8000/restaurantes/estatisticas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEstatisticas(response.data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      error("Erro ao carregar estatísticas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingRestaurante || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600">Nenhuma estatística disponível ainda.</p>
        </div>
      </div>
    );
  }

  const statusIcons = {
    "Recebido": "📥",
    "Em preparo": "👨‍🍳",
    "Saiu para entrega": "🚴",
    "Entregue": "✅",
    "Cancelado": "❌",
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primario mb-2">
          📊 Dashboard
        </h2>
        <p className="text-gray-600">Visão geral do desempenho do seu restaurante</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
              <p className="text-3xl font-bold text-primario">{estatisticas.total_pedidos}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {estatisticas.receita_total.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita (30 dias)</p>
              <p className="text-3xl font-bold text-blue-600">
                R$ {estatisticas.receita_mes.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Média/Dia (30d)</p>
              <p className="text-3xl font-bold text-purple-600">
                {estatisticas.media_pedidos_dia}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-esc mb-4">📋 Pedidos por Status</h3>
          <div className="space-y-3">
            {Object.entries(estatisticas.pedidos_por_status).map(([status, quantidade]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{statusIcons[status] || "📦"}</span>
                  <span className="font-medium text-gray-700">{status}</span>
                </div>
                <span className="font-bold text-primario text-lg">{quantidade}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pratos Mais Vendidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-esc mb-4">🏆 Pratos Mais Vendidos</h3>
          {estatisticas.pratos_mais_vendidos.length > 0 ? (
            <div className="space-y-3">
              {estatisticas.pratos_mais_vendidos.map((prato, index) => (
                <div
                  key={prato.prato_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-primario w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-700">{prato.nome}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {prato.total_vendido} vendido{prato.total_vendido !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum prato vendido ainda
            </p>
          )}
        </motion.div>
      </div>

      {/* Card de Avaliações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-esc mb-2">⭐ Avaliações</h3>
            <p className="text-gray-600">
              Total de {estatisticas.total_avaliacoes} avaliação{estatisticas.total_avaliacoes !== 1 ? 'ões' : ''} recebida{estatisticas.total_avaliacoes !== 1 ? 's' : ''}
            </p>
            {restaurante?.avaliacao_media && Number(restaurante.avaliacao_media) > 0 && (
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                ⭐ {Number(restaurante.avaliacao_media).toFixed(1)}/5.0
              </p>
            )}
          </div>
          <div className="text-6xl">⭐</div>
        </div>
      </motion.div>

      {/* Botão de Atualizar */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={carregarEstatisticas}
          className="bg-primario text-white px-6 py-3 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Atualizar Estatísticas</span>
        </button>
      </div>
    </div>
  );
}

