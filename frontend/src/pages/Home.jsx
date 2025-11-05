import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Card({ r }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4 border border-secundario/50 hover:border-primario/60"
      onClick={() => navigate(`/restaurante/${r.restaurante_id}`)}
    >
      <h3 className="font-semibold text-lg text-primario">{r.nome_fantasia}</h3>
      <p className="text-sm text-gray-700 mt-1">{r.descricao}</p>

      <div className="mt-3 text-sm text-texto flex justify-between items-center">
        <span>⏱️ {r.tempo_medio_entrega ?? "—"} min</span>
        <span>💰 Taxa: R$ {r.taxa_entrega_base ?? "0.00"}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [rests, setRests] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/restaurantes/")
      .then((r) => setRests(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-claro text-texto">
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-primario">🍴 Restaurantes disponíveis</h2>

        {rests.length === 0 ? (
          <p className="text-gray-600 text-center mt-20">
            Nenhum restaurante disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rests.map((r) => (
              <Card key={r.restaurante_id} r={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
