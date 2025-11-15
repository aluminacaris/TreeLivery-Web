import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function Card({ r, index, isRecomendado }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100 group"
      onClick={() => navigate(`/restaurante/${r.restaurante_id}`)}
    >
      <div className="h-40 bg-gradient-to-br from-secundario/30 to-primario/20 flex items-center justify-center overflow-hidden">
        {r.foto_perfil ? (
          <img 
            src={`http://localhost:8000${r.foto_perfil}`}
            alt={r.nome_fantasia}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform">🍽️</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-xl text-primario group-hover:text-destaque transition">
            {r.nome_fantasia}
          </h3>
          {isRecomendado && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
              ✅ Recomendado
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{r.descricao || "Sem descrição"}</p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-700 pt-3 border-t border-gray-100">
          {r.avaliacao_media && Number(r.avaliacao_media) > 0 && (
            <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full">
              <span>⭐</span>
              <span className="font-semibold">{Number(r.avaliacao_media).toFixed(1)}</span>
            </span>
          )}
          {r.tempo_medio_entrega && (
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span className="font-medium">{r.tempo_medio_entrega} min</span>
            </span>
          )}
          {r.taxa_entrega_base && Number(r.taxa_entrega_base) > 0 ? (
            <span className="flex items-center gap-1">
              <span>💰</span>
              <span className="font-medium">R$ {Number(r.taxa_entrega_base).toFixed(2)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600">
              <span>🆓</span>
              <span className="font-medium">Frete grátis</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { usuario } = useAuth();
  const [rests, setRests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("recomendado"); // recomendado, nome, avaliacao, tempo, preco
  const [freteGratis, setFreteGratis] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8000/restaurantes/")
      .then((r) => {
        setRests(r.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Filtros
  const restaurantesFiltrados = rests.filter(r => {
    const matchBusca = busca === "" ||
      r.nome_fantasia.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao?.toLowerCase().includes(busca.toLowerCase());
    
    const matchFreteGratis = !freteGratis || !r.taxa_entrega_base || Number(r.taxa_entrega_base) === 0;
    
    return matchBusca && matchFreteGratis;
  });

  // Função para calcular score de recomendação
  function calcularScoreRecomendacao(restaurante) {
    if (!usuario) return 0;
    
    let score = 0;
    
    // Restaurantes com boa avaliação ganham pontos
    if (restaurante.avaliacao_media && Number(restaurante.avaliacao_media) >= 4) {
      score += 10;
    }
    
    // Frete grátis ganha pontos
    if (!restaurante.taxa_entrega_base || Number(restaurante.taxa_entrega_base) === 0) {
      score += 5;
    }
    
    // Tempo de entrega menor ganha pontos
    if (restaurante.tempo_medio_entrega && restaurante.tempo_medio_entrega <= 30) {
      score += 5;
    }
    
    return score;
  }

  // Ordenação
  const restaurantesOrdenados = [...restaurantesFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case "recomendado":
        const scoreA = calcularScoreRecomendacao(a);
        const scoreB = calcularScoreRecomendacao(b);
        if (scoreB !== scoreA) return scoreB - scoreA; // Maior score primeiro
        // Em caso de empate, ordena por avaliação
        const avalA = Number(a.avaliacao_media) || 0;
        const avalB = Number(b.avaliacao_media) || 0;
        return avalB - avalA;
      
      case "avaliacao":
        const avalA2 = Number(a.avaliacao_media) || 0;
        const avalB2 = Number(b.avaliacao_media) || 0;
        return avalB2 - avalA2; // Maior para menor
      
      case "tempo":
        const tempoA = a.tempo_medio_entrega || 999;
        const tempoB = b.tempo_medio_entrega || 999;
        return tempoA - tempoB; // Menor para maior
      
      case "preco":
        const precoA = Number(a.taxa_entrega_base) || 0;
        const precoB = Number(b.taxa_entrega_base) || 0;
        return precoA - precoB; // Menor para maior
      
      case "nome":
      default:
        return a.nome_fantasia.localeCompare(b.nome_fantasia);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claro text-texto">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primario">🍴 Restaurantes</h1>
          <p className="text-gray-600">Descubra os melhores sabores perto de você</p>
        </div>

        {/* Busca e Filtros */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="🔍 Buscar restaurantes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-3 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
          />
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="px-3 py-2 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario text-sm"
              >
                {usuario && <option value="recomendado">✨ Recomendados</option>}
                <option value="nome">Nome (A-Z)</option>
                <option value="avaliacao">⭐ Melhor Avaliação</option>
                <option value="tempo">⏱️ Menor Tempo</option>
                <option value="preco">💰 Menor Taxa</option>
              </select>
            </div>

            {/* Filtro Frete Grátis */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freteGratis}
                onChange={(e) => setFreteGratis(e.target.checked)}
                className="w-4 h-4 text-primario border-secundario rounded focus:ring-primario"
              />
              <span className="text-sm font-medium text-gray-700">🆓 Apenas frete grátis</span>
            </label>

            {/* Limpar Filtros */}
            {(busca !== "" || freteGratis) && (
              <button
                onClick={() => {
                  setBusca("");
                  setFreteGratis(false);
                }}
                className="text-sm text-primario hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {restaurantesOrdenados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg mb-2 font-medium">
              {busca !== "" 
                ? "Nenhum restaurante encontrado com essa busca." 
                : "Nenhum restaurante disponível no momento."}
            </p>
            {busca !== "" && (
              <button
                onClick={() => setBusca("")}
                className="text-primario hover:underline mt-2"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {restaurantesOrdenados.length} restaurante{restaurantesOrdenados.length !== 1 ? 's' : ''} encontrado{restaurantesOrdenados.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantesOrdenados.map((r, index) => {
                const isRecomendado = usuario && calcularScoreRecomendacao(r) >= 10;
                return (
                  <Card 
                    key={r.restaurante_id} 
                    r={r} 
                    index={index} 
                    isRecomendado={isRecomendado}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
