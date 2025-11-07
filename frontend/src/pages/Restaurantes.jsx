import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";

export default function RestaurantesAdmin() {
  const { restaurante, loading } = useAuthRestaurante();
  const [pratos, setPratos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    restricoes: [],
    imagem: null,
  });
  const [editando, setEditando] = useState(null);
  const [novaRestricao, setNovaRestricao] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pratoSelecionado, setPratoSelecionado] = useState(null);

  const restricoesDisponiveis = [
    "glúten",
    "lactose",
    "castanhas",
    "ovo",
    "mariscos",
    "soja",
    "açúcar",
  ];

  // 🔹 Utilitário para adicionar restrição manual
  function adicionarRestricao() {
    if (!novaRestricao.trim()) return;
    const restricao = novaRestricao.trim().toLowerCase();
    if (form.restricoes.includes(restricao)) return;

    setForm((prev) => ({
      ...prev,
      restricoes: [...prev.restricoes, restricao],
    }));
    setNovaRestricao("");
  }

  // 🔹 Remover restrição personalizada
  function removerRestricaoManual(r) {
    setForm((prev) => ({
      ...prev,
      restricoes: prev.restricoes.filter((x) => x !== r),
    }));
  }

  // 🔹 Buscar pratos
  async function fetchPratos() {
    try {
      const res = await axios.get(
        `http://localhost:8000/restaurantes/${restaurante.restaurante_id}/menu`
      );
      setPratos(res.data);
    } catch (err) {
      console.error("Erro ao buscar pratos:", err);
    }
  }

  // 🔹 Criar novo prato
  async function submitPrato(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("restaurante_token");
      const payload = { ...form, preco: parseFloat(form.preco) };

      const res = await axios.post(
        `http://localhost:8000/restaurantes/${restaurante.restaurante_id}/menu`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pratoCriado = res.data;

      if (form.imagem) {
        const formData = new FormData();
        formData.append("file", form.imagem);

        await axios.post(
          `http://localhost:8000/uploads/prato/${pratoCriado.prato_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setForm({
        nome: "",
        descricao: "",
        preco: "",
        restricoes: [],
        imagem: null,
      });
      setShowForm(false);
      fetchPratos();
    } catch (err) {
      console.error("Erro ao criar prato:", err);
    }
  }

  // 🔹 Atualizar prato
  async function updatePrato(pratoId) {
    try {
      const payload = {
        ...form,
        preco: Number(form.preco),
        restricoes: form.restricoes || [],
      };
      await axios.put(`http://localhost:8000/restaurantes/menu/${pratoId}`, payload);
      setEditando(null);
      setForm({ nome: "", descricao: "", preco: "", restricoes: [] });
      fetchPratos();
    } catch (err) {
      console.error("Erro ao atualizar prato:", err);
    }
  }

  // 🔹 Deletar prato
  async function deletePrato() {
    try {
      await axios.delete(`http://localhost:8000/restaurantes/menu/${pratoSelecionado}`);
      fetchPratos();
      setMostrarModal(false);
    } catch (err) {
      console.error("Erro ao deletar prato:", err);
    }
  }

  useEffect(() => {
    if (restaurante) fetchPratos();
  }, [restaurante]);

  if (loading)
    return <div className="p-8 text-center text-gray-600">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <h2 className="text-3xl font-bold text-primario mb-6">
        Painel do Restaurante
      </h2>

      {restaurante && (
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h3 className="text-xl font-semibold text-esc">
            {restaurante.nome_fantasia}
          </h3>
          <p className="text-gray-600">{restaurante.descricao}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-semibold text-esc">Cardápio</h4>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition"
          >
            {showForm ? "Cancelar" : "+ Novo prato"}
          </button>
        </div>

        {/* 🧾 Formulário animado de novo prato */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={submitPrato}
              className="p-4 border rounded-lg bg-gray-50 shadow-inner space-y-3"
            >
              <input
                required
                placeholder="Nome do prato"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primario"
              />

              <textarea
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primario"
              />

              <input
                required
                type="number"
                step="0.01"
                placeholder="Preço (R$)"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primario"
              />

              {/* Restrições */}
              <div>
                <p className="font-semibold mb-1">Restrições:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {restricoesDisponiveis.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.restricoes?.includes(r)}
                        onChange={(e) => {
                          const novaLista = e.target.checked
                            ? [...form.restricoes, r]
                            : form.restricoes.filter((x) => x !== r);
                          setForm({ ...form, restricoes: novaLista });
                        }}
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="Outra restrição..."
                    value={novaRestricao}
                    onChange={(e) => setNovaRestricao(e.target.value)}
                    className="flex-1 p-2 border rounded-l focus:ring-2 focus:ring-primario"
                  />
                  <button
                    type="button"
                    onClick={adicionarRestricao}
                    className="bg-primario text-white px-3 rounded-r hover:bg-destaque"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.restricoes
                    .filter((r) => !restricoesDisponiveis.includes(r))
                    .map((r) => (
                      <span
                        key={r}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {r}
                        <button
                          type="button"
                          onClick={() => removerRestricaoManual(r)}
                          className="text-red-500 font-bold hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, imagem: e.target.files[0] })
                }
                className="w-full border rounded p-2"
              />

              <button
                type="submit"
                className="bg-primario text-white w-full py-2 rounded-lg hover:bg-destaque transition"
              >
                Salvar prato
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 🍽️ Lista de pratos */}
        <div className="grid gap-4">
          <AnimatePresence>
            {pratos.map((p) => (
              <motion.div
                key={p.prato_id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition"
              >
                {/* imagem + conteúdo aqui (mantém igual à sua versão anterior) */}
                 <div className="w-full sm:w-40 h-32 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                  {p.imagem_url ? (
                    <img
                      src={`http://localhost:8000${p.imagem_url}`}
                      alt={p.nome}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 italic">
                      sem imagem
                    </div>
                  )}
                </div>

                  <div className="flex-1">
                  {editando === p.prato_id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updatePrato(p.prato_id);
                      }}
                      className="space-y-2"
                    >
                      <input
                        value={form.nome}
                        onChange={(e) =>
                          setForm({ ...form, nome: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <textarea
                        value={form.descricao}
                        onChange={(e) =>
                          setForm({ ...form, descricao: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="number"
                        value={form.preco}
                        onChange={(e) =>
                          setForm({ ...form, preco: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />

                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {restricoesDisponiveis.map((r) => (
                          <label key={r} className="flex gap-1 items-center">
                            <input
                              type="checkbox"
                              checked={form.restricoes?.includes(r)}
                              onChange={(e) => {
                                const novaLista = e.target.checked
                                  ? [...form.restricoes, r]
                                  : form.restricoes.filter((x) => x !== r);
                                setForm({ ...form, restricoes: novaLista });
                              }}
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                      <div className="flex mb-2 mt-2">
                        <input
                          type="text"
                          placeholder="Adicionar nova restrição..."
                          value={novaRestricao}
                          onChange={(e) => setNovaRestricao(e.target.value)}
                          className="flex-1 p-2 border rounded-l focus:ring-2 focus:ring-primario"
                        />
                        <button
                          type="button"
                          onClick={adicionarRestricao}
                          className="bg-primario text-white px-3 rounded-r hover:bg-destaque"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {form.restricoes
                          .filter((r) => !restricoesDisponiveis.includes(r))
                          .map((r) => (
                            <span
                              key={r}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              {r}
                              <button
                                type="button"
                                onClick={() => removerRestricaoManual(r)}
                                className="text-red-500 font-bold hover:text-red-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditando(null)}
                          className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h4 className="font-semibold text-lg text-esc">{p.nome}</h4>
                      <p className="text-sm text-gray-600">{p.descricao}</p>
                      <p className="font-semibold text-primario mt-1">
                        R$ {p.preco}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.restricoes?.length
                          ? "Contém: " + p.restricoes.join(", ")
                          : "Sem restrições"}
                      </p>
                    </>
                  )}
                </div>

                                  {/* Ações */}
                {editando !== p.prato_id && (
                  <div className="flex sm:flex-col gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditando(p.prato_id);
                        setForm({
                          nome: p.nome,
                          descricao: p.descricao,
                          preco: p.preco,
                          restricoes: p.restricoes || [],
                        });
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setMostrarModal(true);
                        setPratoSelecionado(p.prato_id);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                )}

                {/* ... */}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 🩶 Modal com animação */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-semibold mb-2 text-esc">
                Confirmar exclusão
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tem certeza que deseja excluir este prato?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={deletePrato}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
