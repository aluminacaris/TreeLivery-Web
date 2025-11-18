import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";
import { useToast } from "../context/ToastContext";

export default function RestaurantesAdmin() {
  const { restaurante, loading, atualizarRestaurante } = useAuthRestaurante();
  const { success, error } = useToast();
  const [pratos, setPratos] = useState([]);
  const [loadingPratos, setLoadingPratos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroDisponivel, setFiltroDisponivel] = useState("todos");
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
  const [salvando, setSalvando] = useState(false);
  const [editandoFoto, setEditandoFoto] = useState(false);
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [formSenha, setFormSenha] = useState({
    senha_atual: "",
    senha_nova: "",
    senha_nova_confirmacao: "",
  });
  const [formPerfil, setFormPerfil] = useState({
    nome_fantasia: "",
    razao_social: "",
    descricao: "",
    telefone: "",
    tempo_medio_entrega: "",
    taxa_entrega_base: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: ""
    }
  });

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
      setLoadingPratos(true);
      const res = await axios.get(
        `http://localhost:8000/restaurantes/${restaurante.restaurante_id}/menu`
      );
      setPratos(res.data);
    } catch (err) {
      console.error("Erro ao buscar pratos:", err);
      error("Erro ao carregar pratos. Tente novamente.");
    } finally {
      setLoadingPratos(false);
    }
  }

  // 🔹 Criar novo prato
  async function submitPrato(e) {
    e.preventDefault();
    
    // Validações
    if (!form.nome.trim()) {
      error("Por favor, informe o nome do prato.");
      return;
    }

    if (!form.preco || Number(form.preco) <= 0) {
      error("Por favor, informe um preço válido maior que zero.");
      return;
    }

    try {
      setSalvando(true);
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
      success("Prato criado com sucesso!");
      fetchPratos();
    } catch (err) {
      console.error("Erro ao criar prato:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao criar prato. Tente novamente.";
      error(errorMsg);
    } finally {
      setSalvando(false);
    }
  }

  // 🔹 Atualizar prato
  async function updatePrato(pratoId) {
    try {
      setSalvando(true);
      const payload = {
        ...form,
        preco: Number(form.preco),
        restricoes: form.restricoes || [],
      };
      await axios.put(`http://localhost:8000/restaurantes/menu/${pratoId}`, payload);
      setEditando(null);
      setForm({ nome: "", descricao: "", preco: "", restricoes: [] });
      success("Prato atualizado com sucesso!");
      fetchPratos();
    } catch (err) {
      console.error("Erro ao atualizar prato:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao atualizar prato. Tente novamente.";
      error(errorMsg);
    } finally {
      setSalvando(false);
    }
  }

  // 🔹 Deletar prato
  async function deletePrato() {
    try {
      await axios.delete(`http://localhost:8000/restaurantes/menu/${pratoSelecionado}`);
      success("Prato excluído com sucesso!");
      fetchPratos();
      setMostrarModal(false);
      setPratoSelecionado(null);
    } catch (err) {
      console.error("Erro ao deletar prato:", err);
      error("Erro ao excluir prato. Tente novamente.");
    }
  }

  // 🔹 Atualizar foto de perfil
  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      error("Por favor, selecione uma imagem válida (JPG, PNG, GIF ou WEBP).");
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setNovaFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewFoto(reader.result);
    reader.readAsDataURL(file);
  }

  async function atualizarFotoPerfil() {
    if (!novaFoto) return;

    try {
      setSalvando(true);
      const token = localStorage.getItem("restaurante_token");
      const formData = new FormData();
      formData.append("foto_perfil", novaFoto);

      const res = await axios.put(
        "http://localhost:8000/restaurantes/foto-perfil",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Atualiza o contexto do restaurante
      atualizarRestaurante(res.data);
      success("Foto de perfil atualizada com sucesso!");
      setEditandoFoto(false);
      setNovaFoto(null);
      setPreviewFoto(null);
    } catch (err) {
      console.error("Erro ao atualizar foto:", err);
      error("Erro ao atualizar foto de perfil. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  // Filtrar pratos
  const pratosFiltrados = pratos.filter(p => {
    const matchBusca = busca === "" || 
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.toLowerCase());
    
    const matchDisponivel = filtroDisponivel === "todos" ||
      (filtroDisponivel === "disponivel" && p.disponivel) ||
      (filtroDisponivel === "indisponivel" && !p.disponivel);
    
    return matchBusca && matchDisponivel;
  });

  // Inicializar formulário de perfil quando restaurante carregar
  useEffect(() => {
    if (restaurante) {
      fetchPratos();
      setFormPerfil({
        nome_fantasia: restaurante.nome_fantasia || "",
        razao_social: restaurante.razao_social || "",
        descricao: restaurante.descricao || "",
        telefone: restaurante.telefone || "",
        tempo_medio_entrega: restaurante.tempo_medio_entrega?.toString() || "",
        taxa_entrega_base: restaurante.taxa_entrega_base?.toString() || "",
        endereco: restaurante.endereco || {
          cep: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          complemento: ""
        }
      });
    }
  }, [restaurante]);

  // Buscar CEP via API
  async function buscarCEP(cep) {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Só busca se tiver 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCEP(true);
    try {
      const response = await axios.get(`http://localhost:8000/cep/${cepLimpo}`);
      const dados = response.data;
      
      // Preenche os campos automaticamente
      setFormPerfil(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: dados.logradouro || prev.endereco.logradouro,
          bairro: dados.bairro || prev.endereco.bairro,
          cidade: dados.cidade || prev.endereco.cidade,
          estado: dados.estado || prev.endereco.estado,
          complemento: dados.complemento || prev.endereco.complemento
        }
      }));
      
      if (dados.logradouro) {
        success("Endereço encontrado e preenchido automaticamente!");
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      if (err.response?.status === 404) {
        error("CEP não encontrado. Por favor, preencha o endereço manualmente.");
      } else {
        error("Erro ao buscar CEP. Tente novamente.");
      }
    } finally {
      setBuscandoCEP(false);
    }
  }

  // Atualizar perfil do restaurante
  async function atualizarPerfil() {
    try {
      setSalvando(true);
      const token = localStorage.getItem("restaurante_token");
      
      const payload = {};
      
      // Adiciona apenas campos que foram preenchidos
      if (formPerfil.nome_fantasia && formPerfil.nome_fantasia.trim()) {
        payload.nome_fantasia = formPerfil.nome_fantasia.trim();
      }
      if (formPerfil.razao_social && formPerfil.razao_social.trim()) {
        payload.razao_social = formPerfil.razao_social.trim();
      }
      if (formPerfil.descricao !== undefined) {
        payload.descricao = formPerfil.descricao.trim() || null;
      }
      if (formPerfil.telefone && formPerfil.telefone.trim()) {
        payload.telefone = formPerfil.telefone.trim();
      }
      if (formPerfil.tempo_medio_entrega && formPerfil.tempo_medio_entrega.trim()) {
        payload.tempo_medio_entrega = parseInt(formPerfil.tempo_medio_entrega);
      }
      if (formPerfil.taxa_entrega_base && formPerfil.taxa_entrega_base.trim()) {
        payload.taxa_entrega_base = parseFloat(formPerfil.taxa_entrega_base);
      }
      if (formPerfil.endereco && Object.values(formPerfil.endereco).some(v => v && v.trim())) {
        payload.endereco = formPerfil.endereco;
      }

      const res = await axios.put(
        "http://localhost:8000/restaurantes/me",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      atualizarRestaurante(res.data);
      success("Perfil atualizado com sucesso!");
      setEditandoPerfil(false);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      const errorMsg = err.response?.data?.detail || "Erro ao atualizar perfil. Tente novamente.";
      error(errorMsg);
    } finally {
      setSalvando(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando...</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primario mb-2">
          🍽️ Painel do Restaurante
        </h2>
        {restaurante && (
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Foto de perfil */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primario flex-shrink-0">
                    {restaurante.foto_perfil ? (
                      <img 
                        src={`http://localhost:8000${restaurante.foto_perfil}`}
                        alt={restaurante.nome_fantasia}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secundario/30 to-primario/20 flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  {!editandoFoto && (
                    <button
                      onClick={() => setEditandoFoto(true)}
                      className="absolute bottom-0 right-0 bg-primario text-white rounded-full p-1.5 shadow-md hover:bg-destaque transition text-xs"
                      title="Editar foto"
                    >
                      📷
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  {!editandoPerfil ? (
                    <>
                      <h3 className="text-2xl font-bold text-esc mb-1">
                        {restaurante.nome_fantasia}
                      </h3>
                      {restaurante.descricao && (
                        <p className="text-gray-600">{restaurante.descricao}</p>
                      )}
                      {restaurante.telefone && (
                        <p className="text-sm text-gray-500 mt-1">📞 {restaurante.telefone}</p>
                      )}
                      {restaurante.endereco && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {restaurante.endereco.logradouro}, {restaurante.endereco.numero} - {restaurante.endereco.bairro}, {restaurante.endereco.cidade}/{restaurante.endereco.estado}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nome Fantasia"
                        value={formPerfil.nome_fantasia}
                        onChange={(e) => setFormPerfil({ ...formPerfil, nome_fantasia: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                      />
                      <input
                        type="text"
                        placeholder="Razão Social"
                        value={formPerfil.razao_social}
                        onChange={(e) => setFormPerfil({ ...formPerfil, razao_social: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                      />
                      <textarea
                        placeholder="Descrição"
                        value={formPerfil.descricao}
                        onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                        rows="2"
                      />
                      <input
                        type="text"
                        placeholder="Telefone (ex: (11) 98765-4321)"
                        value={formPerfil.telefone}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            if (value.length <= 2) {
                              value = value ? `(${value}` : '';
                            } else if (value.length <= 7) {
                              value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                            } else if (value.length <= 10) {
                              value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
                            } else {
                              value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                            }
                            setFormPerfil({ ...formPerfil, telefone: value });
                          }
                        }}
                        maxLength={15}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Tempo médio (min)"
                          min="1"
                          max="300"
                          value={formPerfil.tempo_medio_entrega}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 300)) {
                              setFormPerfil({ ...formPerfil, tempo_medio_entrega: value });
                            }
                          }}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Taxa entrega (R$)"
                          value={formPerfil.taxa_entrega_base}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseFloat(value) >= 0) {
                              setFormPerfil({ ...formPerfil, taxa_entrega_base: value });
                            }
                          }}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                        />
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-semibold mb-2 text-gray-700">Endereço:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="CEP (ex: 12345-678)"
                              value={formPerfil.endereco.cep}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 8) {
                                  if (value.length > 5) {
                                    value = `${value.slice(0, 5)}-${value.slice(5)}`;
                                  }
                                  setFormPerfil({ 
                                    ...formPerfil, 
                                    endereco: { ...formPerfil.endereco, cep: value }
                                  });
                                  
                                  // Busca automaticamente quando tiver 8 dígitos
                                  if (value.replace(/\D/g, '').length === 8) {
                                    setTimeout(() => {
                                      buscarCEP(value);
                                    }, 500);
                                  }
                                }
                              }}
                              maxLength={9}
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                            />
                            {buscandoCEP && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primario"></div>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Estado (ex: SP)"
                            value={formPerfil.endereco.estado}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
                              setFormPerfil({ 
                                ...formPerfil, 
                                endereco: { ...formPerfil.endereco, estado: value }
                              });
                            }}
                            maxLength={2}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Logradouro"
                          value={formPerfil.endereco.logradouro}
                          onChange={(e) => setFormPerfil({ 
                            ...formPerfil, 
                            endereco: { ...formPerfil.endereco, logradouro: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg mt-2 focus:ring-2 focus:ring-primario"
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Número"
                            value={formPerfil.endereco.numero}
                            onChange={(e) => setFormPerfil({ 
                              ...formPerfil, 
                              endereco: { ...formPerfil.endereco, numero: e.target.value }
                            })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                          />
                          <input
                            type="text"
                            placeholder="Bairro"
                            value={formPerfil.endereco.bairro}
                            onChange={(e) => setFormPerfil({ 
                              ...formPerfil, 
                              endereco: { ...formPerfil.endereco, bairro: e.target.value }
                            })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Cidade"
                          value={formPerfil.endereco.cidade}
                          onChange={(e) => setFormPerfil({ 
                            ...formPerfil, 
                            endereco: { ...formPerfil.endereco, cidade: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg mt-2 focus:ring-2 focus:ring-primario"
                        />
                        <input
                          type="text"
                          placeholder="Complemento (opcional)"
                          value={formPerfil.endereco.complemento}
                          onChange={(e) => setFormPerfil({ 
                            ...formPerfil, 
                            endereco: { ...formPerfil.endereco, complemento: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg mt-2 focus:ring-2 focus:ring-primario"
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={atualizarPerfil}
                          disabled={salvando}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {salvando ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Salvando...</span>
                            </>
                          ) : (
                            <>
                              <span>✅</span>
                              <span>Salvar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditandoPerfil(false);
                            // Restaura valores originais
                            setFormPerfil({
                              nome_fantasia: restaurante.nome_fantasia || "",
                              razao_social: restaurante.razao_social || "",
                              descricao: restaurante.descricao || "",
                              telefone: restaurante.telefone || "",
                              tempo_medio_entrega: restaurante.tempo_medio_entrega?.toString() || "",
                              taxa_entrega_base: restaurante.taxa_entrega_base?.toString() || "",
                              endereco: restaurante.endereco || {
                                cep: "",
                                logradouro: "",
                                numero: "",
                                bairro: "",
                                cidade: "",
                                estado: "",
                                complemento: ""
                              }
                            });
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Formulário de edição de foto */}
                  {editandoFoto && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="text-sm"
                        />
                        {previewFoto && (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primario">
                            <img 
                              src={previewFoto} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={atualizarFotoPerfil}
                          disabled={!novaFoto || salvando}
                          className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {salvando ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => {
                            setEditandoFoto(false);
                            setNovaFoto(null);
                            setPreviewFoto(null);
                          }}
                          className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-400 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-primario/10 text-primario px-3 py-1 rounded-lg">
                    <span className="font-semibold">{pratos.length}</span> prato{pratos.length !== 1 ? 's' : ''}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg">
                    <span className="font-semibold">
                      {pratos.filter(p => p.disponivel).length}
                    </span> disponível{pratos.filter(p => p.disponivel).length !== 1 ? 'is' : ''}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!editandoPerfil && (
                    <button
                      onClick={() => setEditandoPerfil(true)}
                      className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2 text-sm"
                    >
                      <span>✏️</span>
                      <span>Editar Perfil</span>
                    </button>
                  )}
                  {!alterandoSenha && (
                    <button
                      onClick={() => setAlterandoSenha(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2 text-sm"
                    >
                      <span>🔒</span>
                      <span>Alterar Senha</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Alteração de Senha do Restaurante */}
      {alterandoSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-esc mb-4">🔒 Alterar Senha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={formSenha.senha_atual}
                  onChange={(e) => setFormSenha({ ...formSenha, senha_atual: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={formSenha.senha_nova}
                  onChange={(e) => setFormSenha({ ...formSenha, senha_nova: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                  placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={formSenha.senha_nova_confirmacao}
                  onChange={(e) => setFormSenha({ ...formSenha, senha_nova_confirmacao: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
                  placeholder="Confirme sua nova senha"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={async () => {
                    if (formSenha.senha_nova !== formSenha.senha_nova_confirmacao) {
                      error("As senhas não coincidem!");
                      return;
                    }
                    if (formSenha.senha_nova.length < 6) {
                      error("A nova senha deve ter pelo menos 6 caracteres!");
                      return;
                    }
                    try {
                      setSalvando(true);
                      const token = localStorage.getItem("restaurante_token");
                      await axios.put(
                        "http://localhost:8000/restaurantes/me/senha",
                        {
                          senha_atual: formSenha.senha_atual,
                          senha_nova: formSenha.senha_nova,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      success("Senha alterada com sucesso!");
                      setAlterandoSenha(false);
                      setFormSenha({
                        senha_atual: "",
                        senha_nova: "",
                        senha_nova_confirmacao: "",
                      });
                    } catch (err) {
                      console.error("Erro ao alterar senha:", err);
                      const errorMsg = err.response?.data?.detail || "Erro ao alterar senha. Tente novamente.";
                      error(errorMsg);
                    } finally {
                      setSalvando(false);
                    }
                  }}
                  disabled={salvando}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Alterando...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Alterar Senha</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setAlterandoSenha(false);
                    setFormSenha({
                      senha_atual: "",
                      senha_nova: "",
                      senha_nova_confirmacao: "",
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h4 className="text-2xl font-bold text-esc">📋 Cardápio</h4>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-primario text-white px-5 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <span>{showForm ? "✕" : "+"}</span>
            <span>{showForm ? "Cancelar" : "Novo Prato"}</span>
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="🔍 Buscar pratos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-2 border border-secundario rounded-lg focus:outline-none focus:ring-2 focus:ring-primario"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroDisponivel("todos")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtroDisponivel === "todos"
                  ? "bg-primario text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({pratos.length})
            </button>
            <button
              onClick={() => setFiltroDisponivel("disponivel")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtroDisponivel === "disponivel"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✅ Disponíveis ({pratos.filter(p => p.disponivel).length})
            </button>
            <button
              onClick={() => setFiltroDisponivel("indisponivel")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtroDisponivel === "indisponivel"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ❌ Indisponíveis ({pratos.filter(p => !p.disponivel).length})
            </button>
          </div>
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
                disabled={salvando}
                className="bg-primario text-white w-full py-2 rounded-lg hover:bg-destaque transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Salvar Prato</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 🍽️ Lista de pratos */}
        {loadingPratos ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primario mx-auto mb-3"></div>
              <p className="text-gray-600">Carregando pratos...</p>
            </div>
          </div>
        ) : pratosFiltrados.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-600 text-lg mb-2 font-medium">
              {busca !== "" || filtroDisponivel !== "todos"
                ? "Nenhum prato encontrado com os filtros aplicados."
                : "Nenhum prato cadastrado ainda."}
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
          <div className="grid gap-4">
            <AnimatePresence>
              {pratosFiltrados.map((p, index) => (
                <motion.div
                  key={p.prato_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 80 }}
                  className={`border rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-md hover:shadow-lg transition ${
                    !p.disponivel ? "opacity-60 bg-gray-50" : "bg-white"
                  }`}
                >
                {/* imagem + conteúdo aqui (mantém igual à sua versão anterior) */}
                  <div className="w-full sm:w-40 h-32 bg-gradient-to-br from-secundario/20 to-primario/10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    {p.imagem_url ? (
                      <img
                        src={`http://localhost:8000${p.imagem_url}`}
                        alt={p.nome}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl">🍽️</span>
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
                          disabled={salvando}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {salvando ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Salvando...</span>
                            </>
                          ) : (
                            <>
                              <span>✅</span>
                              <span>Salvar</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(null);
                            setForm({ nome: "", descricao: "", preco: "", restricoes: [] });
                          }}
                          className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-lg text-esc">{p.nome}</h4>
                        {!p.disponivel && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            Indisponível
                          </span>
                        )}
                      </div>
                      {p.descricao && (
                        <p className="text-sm text-gray-600 mb-2">{p.descricao}</p>
                      )}
                      <p className="font-bold text-xl text-primario mb-2">
                        R$ {Number(p.preco).toFixed(2)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.restricoes?.length > 0 ? (
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          setMostrarModal(true);
                          setPratoSelecionado(p.prato_id);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium flex items-center gap-2"
                      >
                        <span>🗑️</span>
                        <span>Excluir</span>
                      </button>
                    </div>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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
