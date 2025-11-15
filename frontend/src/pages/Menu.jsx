import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Menu() {
  const { restauranteId } = useParams();
  const [pratos, setPratos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const { cartItems, addToCart, clearCart, total, removeFromCart } = useCart();
  const { usuario } = useAuth();
  const { success, error, info, warning } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, [restauranteId]);

  async function carregarDados() {
    try {
      setLoading(true);
      const [menuResponse, restauranteResponse, avaliacoesResponse] = await Promise.all([
        axios.get(`http://localhost:8000/restaurantes/${restauranteId}/menu`),
        axios.get(`http://localhost:8000/restaurantes/${restauranteId}`),
        axios.get(`http://localhost:8000/avaliacoes/restaurante/${restauranteId}`).catch(() => ({ data: [] }))
      ]);
      setPratos(menuResponse.data);
      setRestaurante(restauranteResponse.data);
      setAvaliacoes(avaliacoesResponse.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      error("Erro ao carregar informações do restaurante.");
    } finally {
      setLoading(false);
    }
  }

  // Função para verificar compatibilidade do prato com o usuário
  function isPratoCompativel(prato) {
    if (!usuario) return true; // Se não estiver logado, mostra todos

    // Verifica restrições do usuário
    if (usuario.restricoes && usuario.restricoes.length > 0) {
      if (prato.restricoes && prato.restricoes.length > 0) {
        const temRestricaoIncompativel = prato.restricoes.some((r) =>
          usuario.restricoes.some((ur) => 
            r.toLowerCase().includes(ur.toLowerCase()) || 
            ur.toLowerCase().includes(r.toLowerCase())
          )
        );
        if (temRestricaoIncompativel) return false;
      }
    }

    // Se usuário é seletivo, pode querer ver apenas pratos sem restrições
    if (usuario.seletividade && prato.restricoes && prato.restricoes.length > 0) {
      return false;
    }

    return true;
  }

  function getCompatibilidadeBadge(prato) {
    if (!usuario) return null;
    
    const compativel = isPratoCompativel(prato);
    if (!compativel) {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
          ⚠️ Incompatível com suas restrições
        </span>
      );
    }
    
    // Destaca pratos recomendados
    if (usuario.tipo_dieta) {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          ✅ Recomendado
        </span>
      );
    }
    
    return null;
  }

  async function finalizarPedido() {
    if (cartItems.length === 0) {
      info("Seu carrinho está vazio!");
      return;
    }

    try {
      setFinalizando(true);
      const payload = {
        restaurante_id: restauranteId,
        itens: cartItems.map((item) => ({
          prato_id: item.prato_id,
          quantidade: item.quantity,
        })),
      };

      const response = await axios.post("http://localhost:8000/pedidos/", payload);
      success(`Pedido realizado com sucesso! ID: ${response.data.pedido_id.slice(0, 8).toUpperCase()}`);
      clearCart();
      // Redireciona para a página de pedidos após criar
      setTimeout(() => navigate("/meus-pedidos"), 1500);
    } catch (err) {
      console.error("❌ Erro ao criar pedido:", err);
      if (err.response?.status === 401) {
        error("Você precisa estar logado para fazer um pedido.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        error("Erro ao finalizar pedido. Tente novamente.");
      }
    } finally {
      setFinalizando(false);
    }
  }

  const pratosFiltrados = pratos.filter(p => {
    const matchBusca = busca === "" || 
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.toLowerCase());
    return matchBusca;
  });

  // Ordena pratos: compatíveis primeiro
  const pratosOrdenados = [...pratosFiltrados].sort((a, b) => {
    const aCompativel = isPratoCompativel(a);
    const bCompativel = isPratoCompativel(b);
    if (aCompativel && !bCompativel) return -1;
    if (!aCompativel && bCompativel) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Informações do Restaurante */}
      {restaurante && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Foto de perfil do restaurante */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primario flex-shrink-0">
                {restaurante.foto_perfil ? (
                  <img 
                    src={`http://localhost:8000${restaurante.foto_perfil}`}
                    alt={restaurante.nome_fantasia}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secundario/30 to-primario/20 flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-primario mb-2">{restaurante.nome_fantasia}</h1>
                {restaurante.descricao && (
                  <p className="text-gray-600 mb-3">{restaurante.descricao}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {restaurante.avaliacao_media && Number(restaurante.avaliacao_media) > 0 && (
                    <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                      <span>⭐</span>
                      <span>{Number(restaurante.avaliacao_media).toFixed(1)}</span>
                    </span>
                  )}
                  {restaurante.tempo_medio_entrega && (
                    <span className="flex items-center gap-1">
                      ⏱️ {restaurante.tempo_medio_entrega} min
                    </span>
                  )}
                  {restaurante.taxa_entrega_base && Number(restaurante.taxa_entrega_base) > 0 && (
                    <span className="flex items-center gap-1">
                      💰 Taxa: R$ {Number(restaurante.taxa_entrega_base).toFixed(2)}
                    </span>
                  )}
                  {restaurante.telefone && (
                    <span className="flex items-center gap-1">
                      📞 {restaurante.telefone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-secundario text-white font-medium px-4 py-2 rounded-lg hover:bg-destaque transition whitespace-nowrap"
            >
              ← Voltar
            </button>
          </div>
        </motion.div>
      )}

      {/* Seção de Avaliações */}
      {restaurante && avaliacoes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-primario mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Avaliações dos Clientes</span>
            {restaurante.avaliacao_media && Number(restaurante.avaliacao_media) > 0 && (
              <span className="text-lg text-gray-600 font-normal">
                ({Number(restaurante.avaliacao_media).toFixed(1)} de {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''})
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {avaliacoes.slice(0, 10).map((avaliacao) => (
              <div
                key={avaliacao.avaliacao_id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= avaliacao.nota ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(avaliacao.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {avaliacao.comentario && (
                  <p className="text-sm text-gray-700 italic">
                    "{avaliacao.comentario}"
                  </p>
                )}
              </div>
            ))}
          </div>
          {avaliacoes.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Mostrando 10 de {avaliacoes.length} avaliações
            </p>
          )}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de pratos */}
        <div className="flex-1">
          {/* Busca */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Buscar pratos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
            />
          </div>

          {pratosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-600 text-lg mb-2 font-medium">
                {busca !== "" 
                  ? "Nenhum prato encontrado com essa busca." 
                  : "Nenhum prato disponível no momento."}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {pratosOrdenados.map((p, index) => {
                  const compativel = isPratoCompativel(p);
                  return (
                    <motion.div
                      key={p.prato_id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: compativel ? 1 : 0.6, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col border ${
                        compativel ? "border-gray-100" : "border-red-200"
                      }`}
                    >
                    {/* Imagem */}
                    {p.imagem_url ? (
                      <img
                        src={`http://localhost:8000${p.imagem_url}`}
                        alt={p.nome}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-secundario/20 to-primario/10 flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div className="flex flex-col justify-between flex-1 p-4">
                      {/* Informações */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-esc flex-1">{p.nome}</h3>
                          {getCompatibilidadeBadge(p)}
                        </div>
                        {p.descricao && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.descricao}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                          {p.restricoes && p.restricoes.length > 0 ? (
                            p.restricoes.map((r, i) => (
                              <span
                                key={i}
                                className="bg-secundario/20 text-secundario text-xs px-2 py-1 rounded-full font-medium"
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
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-bold text-xl text-primario">
                          R$ {Number(p.preco).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            if (!compativel) {
                              warning("Este prato pode não ser compatível com suas restrições. Deseja continuar?");
                            }
                            addToCart(p);
                            success(`${p.nome} adicionado ao carrinho!`);
                          }}
                          className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                            compativel
                              ? "bg-primario text-white hover:bg-destaque"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          <span>+</span>
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Carrinho Sticky */}
        <div className="lg:w-96 lg:sticky lg:top-4 lg:h-fit">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-primario text-xl mb-4 flex items-center gap-2">
              <span>🛒</span>
              <span>Seu Carrinho</span>
              {cartItems.length > 0 && (
                <span className="bg-primario text-white text-sm px-2 py-1 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </h3>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-gray-500">Seu carrinho está vazio.</p>
                <p className="text-sm text-gray-400 mt-2">Adicione itens do cardápio</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.prato_id}
                      className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-texto block truncate">{item.nome}</span>
                        <span className="text-sm text-gray-500">
                          R$ {Number(item.preco).toFixed(2)} cada
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => addToCart(item, -1)}
                          className="bg-secundario/20 text-primario rounded-full w-7 h-7 flex items-center justify-center hover:bg-secundario/30 transition"
                        >
                          −
                        </button>

                        <span className="text-texto font-medium w-6 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => addToCart(item, 1)}
                          className="bg-primario text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-destaque transition"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item.prato_id)}
                          className="ml-1 text-red-500 hover:text-red-700 text-sm p-1"
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center font-semibold text-lg mb-2">
                    <span>Subtotal:</span>
                    <span className="text-primario">R$ {Number(total).toFixed(2)}</span>
                  </div>
                  {restaurante?.taxa_entrega_base && Number(restaurante.taxa_entrega_base) > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Taxa de entrega:</span>
                      <span>R$ {Number(restaurante.taxa_entrega_base).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-xl pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-primario">
                      R$ {(Number(total) + Number(restaurante?.taxa_entrega_base || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={finalizarPedido}
                  disabled={finalizando}
                  className="w-full bg-primario text-white font-semibold py-3 rounded-lg hover:bg-destaque transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {finalizando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Finalizando...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Finalizar Pedido</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
