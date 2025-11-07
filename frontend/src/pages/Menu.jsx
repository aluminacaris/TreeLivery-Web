import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Menu() {
  const { restauranteId } = useParams();
  const [pratos, setPratos] = useState([]);
  const { cartItems, addToCart, clearCart, total } = useCart();
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
      alert(`Pedido realizado com sucesso! ID do pedido: ${response.data.pedido_id}`);
      clearCart();
    } catch (err) {
      console.error("❌ Erro ao criar pedido:", err);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 text-primario">Cardápio</h2>
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-texto bg-secundario px-3 py-1 rounded hover:bg-destaque transition"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pratos.map((p) => (
          <div key={p.prato_id} className="bg-white p-4 rounded shadow hover:shadow-md transition">
            <h3 className="font-semibold text-primario">{p.nome}</h3>
            <p className="text-gray-600">{p.descricao}</p>
            <p className="mt-2 font-bold text-texto">R$ {p.preco}</p>
            <p className="mt-2 font-bold text-texto">Possui: {p.restricoes.join(", ")}</p>
            <button
              onClick={() => addToCart(p)}
              className="mt-2 bg-primario text-white px-3 py-1 rounded hover:bg-destaque hover:text-texto transition"
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      {/* Carrinho */}
      <div className="bg-secundario/40 p-4 rounded-lg shadow mt-6">
        <h3 className="font-bold mb-2 text-primario">🛒 Carrinho</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-600">Seu carrinho está vazio.</p>
        ) : (
          <ul className="mb-2">
            {cartItems.map((item) => (
              <li key={item.prato_id} className="flex justify-between border-b py-1">
                <span>{item.nome} x {item.quantity}</span>
                <span>R$ {(item.preco * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="font-bold text-texto">Total: R$ {total.toFixed(2)}</p>
        <button
          onClick={finalizarPedido}
          className="w-full py-2 rounded mt-3 bg-primario text-white hover:bg-destaque hover:text-texto transition"
        >
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}
