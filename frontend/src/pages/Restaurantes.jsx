import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [form, setForm] = useState({
    nome_fantasia: "",
    descricao: "",
    tempo_medio_entrega: "",
    taxa_entrega_base: "",
  });

  // busca os restaurantes já cadastrados
  useEffect(() => {
    buscarRestaurantes();
  }, []);

  async function buscarRestaurantes() {
    try {
      const res = await axios.get("http://localhost:8000/restaurantes/");
      setRestaurantes(res.data);
    } catch (err) {
      console.error("Erro ao carregar restaurantes:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        nome_fantasia: form.nome_fantasia,
        descricao: form.descricao,
        tempo_medio_entrega: Number(form.tempo_medio_entrega),
        taxa_entrega_base: Number(form.taxa_entrega_base),
      };

      const res = await axios.post("http://localhost:8000/restaurantes/", payload);
      console.log("✅ Restaurante criado:", res.data);
      setForm({
        nome_fantasia: "",
        descricao: "",
        tempo_medio_entrega: "",
        taxa_entrega_base: "",
      });
      buscarRestaurantes();
    } catch (err) {
      console.error("❌ Erro ao criar restaurante:", err);
      alert("Erro ao criar restaurante");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-primario">
        🍴 Cadastro de Restaurantes
      </h2>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primario"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tempo médio de entrega (min)</label>
            <input
              type="number"
              value={form.tempo_medio_entrega}
              onChange={(e) => setForm({ ...form, tempo_medio_entrega: e.target.value })}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primario"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Taxa base de entrega (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.taxa_entrega_base}
              onChange={(e) => setForm({ ...form, taxa_entrega_base: e.target.value })}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primario"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primario"
              rows={3}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-primario text-white px-5 py-2 rounded hover:bg-destaque transition"
        >
          Cadastrar Restaurante
        </button>
      </form>

      {/* Lista */}
      <h3 className="text-2xl font-semibold mb-3 text-primario">Restaurantes cadastrados</h3>
      {restaurantes.length === 0 ? (
        <p className="text-gray-500">Nenhum restaurante cadastrado ainda.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {restaurantes.map((r) => (
            <div key={r.restaurante_id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
              <h4 className="font-semibold text-lg">{r.nome_fantasia}</h4>
              <p className="text-gray-600 text-sm mb-1">{r.descricao}</p>
              <p className="text-sm text-gray-700">
                Entrega: {r.tempo_medio_entrega} min • Taxa: R$ {r.taxa_entrega_base}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
