import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, number, removeItem } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function Menu() {
  const { restauranteId } = useParams();
  const [pratos, setPratos] = useState([]);
  const { cartItems, addToCart, clearCart, total, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/restaurantes/${restauranteId}/menu`)
      .then((r) => setPratos(r.data))
      .catch(() => {});
  }, [restauranteId]);

  async function finalizarPedido() {
    if (cartItems.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    try {
      const payload = {
        restaurante_id: restauranteId,
        itens: cartItems.map((item) => ({
          prato_id: item.prato_id,
          quantidade: item.quantity,
        })),
      };

      const response = await axios.post("http://localhost:8000/pedidos/", payload);
      alert(`✅ Pedido realizado com sucesso! ID: ${response.data.pedido_id}`);
      clearCart();
    } catch (err) {
      console.error("❌ Erro ao criar pedido:", err);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primario">🍽️ Cardápio</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-secundario text-white font-medium px-4 py-2 rounded-lg hover:bg-destaque transition"
        >
          ← Voltar
        </button>
      </div>

      {/* Lista de pratos */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <AnimatePresence>
    {pratos.map((p) => (
      <motion.div
        key={p.prato_id}
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden flex flex-col"
      >
        {/* Imagem */}
        {p.imagem_url ? (
          <img
            src={`http://localhost:8000${p.imagem_url}`}
            alt={p.nome}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 italic">
            sem imagem
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex flex-col justify-between flex-1 p-4">
          {/* Informações */}
          <div>
            <h3 className="text-lg font-semibold text-esc mb-1">{p.nome}</h3>
            <p className="text-gray-600 text-sm mb-2">{p.descricao}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {p.restricoes && p.restricoes.length > 0 ? (
                p.restricoes.map((r, i) => (
                  <span
                    key={i}
                    className="bg-secundario/20 text-secundario text-xs px-2 py-1 rounded-full"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Sem restrições</span>
              )}
            </div>
          </div>

          {/* Rodapé do card */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-bold text-lg text-primario">
              R$ {Number(p.preco).toFixed(2)}
            </span>
            <button
              onClick={() => addToCart(p)}
              className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium"
            >
              + Adicionar
            </button>
          </div>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

{/* Carrinho */}
<div className="bg-white p-6 rounded-xl shadow mt-10">
  <h3 className="font-bold text-primario text-lg mb-4 flex items-center gap-2">
    🛒 Seu Carrinho
  </h3>

  {cartItems.length === 0 ? (
    <p className="text-gray-500 text-center py-4">Seu carrinho está vazio.</p>
  ) : (
    <>
      <ul className="divide-y divide-gray-200 mb-4">
        {cartItems.map((item) => (
          <li
            key={item.prato_id}
            className="flex justify-between items-center py-3"
          >
            <div className="flex flex-col">
              <span className="font-medium text-texto">{item.nome}</span>
              <span className="text-sm text-gray-500">
                R$ {Number(item.preco).toFixed(2)} cada
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => addToCart(item, -1)}
                className="bg-secundario/20 text-primario rounded-full w-7 h-7 flex items-center justify-center hover:bg-secundario/30"
              >
                −
              </button>

              <span className="text-texto font-medium w-6 text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => addToCart(item, 1)}
                className="bg-primario text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-destaque"
              >
                +
              </button>

              <button
                onClick={() => removeFromCart(item.prato_id)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center font-semibold text-lg border-t pt-4">
        <span>Total:</span>
        <span className="text-primario">R$ {Number(total).toFixed(2)}</span>
      </div>

      <button
        onClick={finalizarPedido}
        className="mt-5 w-full bg-primario text-white font-semibold py-2 rounded-lg hover:bg-destaque transition"
      >
        Finalizar Pedido
      </button>
    </>
  )}
</div>
    </div>
  );
}
