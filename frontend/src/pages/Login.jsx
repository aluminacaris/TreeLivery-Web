import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error } = useToast();

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    // Validações
    if (!email.trim()) {
      setErro("Por favor, informe seu email.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Por favor, informe um email válido.");
      return;
    }

    if (!senha) {
      setErro("Por favor, informe sua senha.");
      return;
    }

    if (senha.length < 3) {
      setErro("A senha deve ter pelo menos 3 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const ok = await login(email, senha);
      if (ok) {
        navigate("/");
      } else {
        setErro("Email ou senha inválidos.");
        error("Email ou senha inválidos.");
      }
    } catch (err) {
      setErro("Erro ao fazer login. Tente novamente.");
      error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-claro">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-secundario"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-primario">Entrar</h1>

        {erro && <p className="text-red-500 mb-3 text-center">{erro}</p>}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-secundario"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border rounded mb-5 focus:outline-none focus:ring-2 focus:ring-secundario"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-primario text-white font-semibold w-full py-2 rounded hover:bg-destaque hover:text-texto transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Entrando...</span>
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Não tem conta?
          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className="text-primario font-medium ml-1 hover:underline"
          >
            Cadastre-se
          </button>
        </p>

         <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/login-restaurante")}
            className="text-sm text-gray-500 hover:text-primario"
          >
            Fazer login como restaurante
          </button>
        </div>

      </form>
    </div>
  );
}
