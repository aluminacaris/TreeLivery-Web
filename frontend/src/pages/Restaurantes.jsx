// src/pages/RestaurantesAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";

export default function RestaurantesAdmin(){
  const { restaurante, loading } = useAuthRestaurante();
  const [pratos, setPratos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome:"", descricao:"", preco:"", restricoes:[] });
  const [editando, setEditando] = useState(null);


  const restricoesDisponiveis = [
  "glúten",
  "lactose",
  "castanhas",
  "ovo",
  "mariscos",
  "soja",
  "açúcar",
  ];

  const [novaRestricao, setNovaRestricao] = useState("");

  function adicionarRestricao() {
  if (!novaRestricao.trim()) return; // ignora vazio

  // evita duplicatas
  if (form.restricoes.includes(novaRestricao.trim().toLowerCase())) return;

  setForm((prev) => ({
      ...prev,
      restricoes: [...prev.restricoes, novaRestricao.trim().toLowerCase()],
  }));

  setNovaRestricao(""); // limpa o input
}

  async function updatePrato(pratoId) {
  try {
    const payload = {
      ...form,
      preco: Number(form.preco),
      restricoes: form.restricoes || []
    };

    await axios.put(
      `http://localhost:8000/restaurantes/menu/${pratoId}`,
      payload
    );

    setEditando(null);
    setForm({ nome: "", descricao: "", preco: "", restricoes: [] });
    fetchPratos();
    alert("Prato atualizado!");
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar prato");
  }
}

  async function deletePrato(pratoId) {
  if (!window.confirm("Tem certeza que deseja excluir este prato?")) return;

  try {
    await axios.delete(`http://localhost:8000/restaurantes/menu/${pratoId}`);
    fetchPratos();
  } catch (err) {
    console.error("Erro ao deletar prato:", err);
  }
}

  useEffect(() => {
    if (restaurante) fetchPratos();
  }, [restaurante]);

  async function fetchPratos(){
    try{
      const res = await axios.get(`http://localhost:8000/restaurantes/${restaurante.restaurante_id}/menu`);
      setPratos(res.data);
    } catch(err){
      console.error("Erro ao buscar pratos:", err);
    }
  }

  async function submitPrato(e){

    e.preventDefault();
    try{
      const payload = { ...form, preco: Number(form.preco) };
      await axios.post(`http://localhost:8000/restaurantes/${restaurante.restaurante_id}/menu`, payload);
      setForm({ nome:"", descricao:"", preco:"", restricoes:[] });
      setShowForm(false);
      fetchPratos();
      alert("Prato criado!");
    } catch(err){
      console.error(err);
      alert("Erro ao criar prato");
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-primario mb-4">Painel do Restaurante</h2>

      {restaurante ? (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-semibold">{restaurante.nome_fantasia}</h3>
          <p className="text-sm text-gray-600">{restaurante.descricao}</p>
        </div>
      ) : (
        <div>Não autenticado.</div>
      )}

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold">Cardápio</h4>
          <button onClick={()=>setShowForm(s=>!s)} className="bg-primario text-white px-3 py-1 rounded">{showForm ? "Fechar" : "+ Novo prato"}</button>
        </div>

        {showForm && (
          <form onSubmit={submitPrato} className="mb-4">
            <input required placeholder="Nome" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} className="w-full p-2 border rounded mb-2"/>

            <textarea placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} className="w-full p-2 border rounded mb-2"/>

            <input required type="number" step="0.01" placeholder="Preço" value={form.preco} onChange={e=>setForm({...form, preco:e.target.value})} className="w-full p-2 border rounded mb-2"/>

            <div className="mb-3">
              <p className="font-semibold mb-1">Restrições:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {restricoesDisponiveis.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.restricoes?.includes(r)}
                      onChange={(e) => {
                        const novaLista = e.target.checked
                          ? [...(form.restricoes || []), r]
                          : form.restricoes.filter((x) => x !== r);
                        setForm({ ...form, restricoes: novaLista });
                      }}
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex mb-3">
              <input
                type="text"
                placeholder="Outra restrição..."
                value={novaRestricao}
                onChange={(e) => setNovaRestricao(e.target.value)}
                className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-primario"
              />

              <button
                type="button"
                onClick={adicionarRestricao}
                aria-label="Adicionar restrição"
                className="bg-primario text-white px-4 rounded-r font-bold text-lg hover:bg-destaque active:scale-95 transition-transform"
              >
                +
              </button>
            </div>

            {/* Mostrar restrições selecionadas */}
            {form.restricoes.length > 0 && (
              <ul className="text-sm text-texto mb-3">
                {form.restricoes.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <button type="submit" className="bg-primario text-white px-4 py-2 rounded">Salvar</button>
            </div>
          </form>
        )}

{pratos.length === 0 ? (
  <p>Nenhum prato</p>
) : (
  pratos.map((p) => (
    <div
      key={p.prato_id}
      className="border rounded p-3 mb-2 flex justify-between items-center"
    >
      {editando === p.prato_id ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updatePrato(p.prato_id);
          }}
          className="flex-1 flex flex-col gap-2"
        >
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="p-2 border rounded"
          />
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Salvar
          </button>
        </form>
      ) : (
        <>
          <div>
            <div className="font-semibold">{p.nome}</div>
            <div className="text-sm text-gray-600">{p.descricao}</div>
            <div className="text-sm text-gray-600">Contém: {p.restricoes.join(", ")}</div>
            <div className="text-sm text-gray-800">R$ {p.preco}</div>
            <div className="text-xs text-gray-500">
              {p.restricoes?.length
                ? p.restricoes.join(", ")
                : "Sem restrições"}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditando(p.prato_id);
                setForm({
                  nome: p.nome,
                  descricao: p.descricao,
                  preco: p.preco,
                  restricoes: p.restricoes || []
                });
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              ✏️
            </button>
            <button
              onClick={() => deletePrato(p.prato_id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              🗑️
            </button>
          </div>
        </>
      )}
    </div>
  ))
)}      </div>
    </div>
  );
}
