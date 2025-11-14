import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

function Card({ r, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100 group"
      onClick={() => navigate(`/restaurante/${r.restaurante_id}`)}
    >
      <div className="h-40 bg-gradient-to-br from-secundario/30 to-primario/20 flex items-center justify-center">
        <span className="text-6xl group-hover:scale-110 transition-transform">🍽️</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-xl text-primario mb-2 group-hover:text-destaque transition">
          {r.nome_fantasia}
        </h3>
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
  const [rests, setRests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

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

  const restaurantesFiltrados = rests.filter(r =>
    busca === "" ||
    r.nome_fantasia.toLowerCase().includes(busca.toLowerCase()) ||
    r.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

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

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar restaurantes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-3 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
          />
        </div>

        {restaurantesFiltrados.length === 0 ? (
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
              {restaurantesFiltrados.length} restaurante{restaurantesFiltrados.length !== 1 ? 's' : ''} encontrado{restaurantesFiltrados.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantesFiltrados.map((r, index) => (
                <Card key={r.restaurante_id} r={r} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
