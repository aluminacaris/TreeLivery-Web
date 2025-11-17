import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function PerfilUsuario() {
  const { usuario, carregarUsuario } = useAuth();
  const { success, error } = useToast();
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  const [formPerfil, setFormPerfil] = useState({
    nome: "",
    tipo_dieta: "",
    restricoes: [],
    seletividade: false,
  });
  
  const [formSenha, setFormSenha] = useState({
    senha_atual: "",
    senha_nova: "",
    senha_nova_confirmacao: "",
  });
  
  const [novaRestricao, setNovaRestricao] = useState("");
  
  const tiposDieta = [
    "Nenhuma",
    "Vegetariano",
    "Vegano",
    "Paleo",
    "Cetogênica",
    "Sem glúten",
    "Sem lactose",
  ];
  
  const restricoesDisponiveis = [
    "glúten",
    "lactose",
    "castanhas",
    "ovo",
    "mariscos",
    "soja",
    "açúcar",
  ];

  useEffect(() => {
    if (usuario) {
      setFormPerfil({
        nome: usuario.nome || "",
        tipo_dieta: usuario.tipo_dieta || "",
        restricoes: usuario.restricoes || [],
        seletividade: usuario.seletividade || false,
      });
    }
  }, [usuario]);

  function adicionarRestricao() {
    if (!novaRestricao.trim()) return;
    const restricao = novaRestricao.trim().toLowerCase();
    if (formPerfil.restricoes.includes(restricao)) return;
    
    setFormPerfil({
      ...formPerfil,
      restricoes: [...formPerfil.restricoes, restricao],
    });
    setNovaRestricao("");
  }

  function removerRestricao(r) {
    setFormPerfil({
      ...formPerfil,
      restricoes: formPerfil.restricoes.filter((x) => x !== r),
    });
  }

  async function atualizarPerfil() {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token");
      
      const payload = {};
      if (formPerfil.nome && formPerfil.nome.trim()) {
        payload.nome = formPerfil.nome.trim();
      }
      if (formPerfil.tipo_dieta !== undefined) {
        payload.tipo_dieta = formPerfil.tipo_dieta || null;
      }
      if (formPerfil.restricoes !== undefined) {
        payload.restricoes = formPerfil.restricoes;
      }
      if (formPerfil.seletividade !== undefined) {
        payload.seletividade = formPerfil.seletividade;
      }

      await axios.put(
        "http://localhost:8000/usuarios/me",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await carregarUsuario();
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

  async function alterarSenha() {
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
      const token = localStorage.getItem("token");
      
      await axios.put(
        "http://localhost:8000/usuarios/me/senha",
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
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primario mx-auto mb-4"></div>
          <p className="text-primario font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primario mb-2">
          👤 Meu Perfil
        </h2>
        <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Informações do Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-esc">Informações Pessoais</h3>
          {!editandoPerfil && (
            <button
              onClick={() => setEditandoPerfil(true)}
              className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Editar Perfil</span>
            </button>
          )}
        </div>

        {!editandoPerfil ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome</label>
              <p className="text-lg text-esc font-semibold">{usuario.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg text-esc">{usuario.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Dieta</label>
              <p className="text-lg text-esc">{usuario.tipo_dieta || "Não especificado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Restrições Alimentares</label>
              {usuario.restricoes && usuario.restricoes.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {usuario.restricoes.map((r, i) => (
                    <span
                      key={i}
                      className="bg-secundario/20 text-secundario text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-gray-500">Nenhuma restrição cadastrada</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Seletividade Alimentar</label>
              <p className="text-lg text-esc">
                {usuario.seletividade ? "Sim" : "Não"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Membro desde</label>
              <p className="text-lg text-esc">
                {new Date(usuario.criado_em).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formPerfil.nome}
                onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Dieta
              </label>
              <select
                value={formPerfil.tipo_dieta || ""}
                onChange={(e) => setFormPerfil({ ...formPerfil, tipo_dieta: e.target.value || null })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primario"
              >
                <option value="">Nenhuma</option>
                {tiposDieta.filter(d => d !== "Nenhuma").map((dieta) => (
                  <option key={dieta} value={dieta}>
                    {dieta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrições Alimentares
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {restricoesDisponiveis.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formPerfil.restricoes?.includes(r)}
                      onChange={(e) => {
                        const novaLista = e.target.checked
                          ? [...formPerfil.restricoes, r]
                          : formPerfil.restricoes.filter((x) => x !== r);
                        setFormPerfil({ ...formPerfil, restricoes: novaLista });
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
                  onKeyPress={(e) => e.key === "Enter" && adicionarRestricao()}
                  className="flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-primario"
                />
                <button
                  type="button"
                  onClick={adicionarRestricao}
                  className="bg-primario text-white px-3 rounded-r-lg hover:bg-destaque"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formPerfil.restricoes
                  .filter((r) => !restricoesDisponiveis.includes(r))
                  .map((r) => (
                    <span
                      key={r}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => removerRestricao(r)}
                        className="text-red-500 font-bold hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formPerfil.seletividade}
                  onChange={(e) => setFormPerfil({ ...formPerfil, seletividade: e.target.checked })}
                />
                Tenho seletividade alimentar
              </label>
            </div>

            <div className="flex gap-2 pt-4">
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
                  setFormPerfil({
                    nome: usuario.nome || "",
                    tipo_dieta: usuario.tipo_dieta || "",
                    restricoes: usuario.restricoes || [],
                    seletividade: usuario.seletividade || false,
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Alteração de Senha */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-esc">Segurança</h3>
          {!alterandoSenha && (
            <button
              onClick={() => setAlterandoSenha(true)}
              className="bg-primario text-white px-4 py-2 rounded-lg hover:bg-destaque transition font-medium flex items-center gap-2"
            >
              <span>🔒</span>
              <span>Alterar Senha</span>
            </button>
          )}
        </div>

        {alterandoSenha ? (
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
                onClick={alterarSenha}
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
        ) : (
          <p className="text-gray-600">Clique em "Alterar Senha" para modificar sua senha de acesso.</p>
        )}
      </motion.div>
    </div>
  );
}

