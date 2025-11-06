// src/pages/LoginRestaurante.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";

export default function LoginRestaurante() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginRestaurante } = useAuthRestaurante();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setErro("");

    const sucesso = await loginRestaurante(email, senha);
        if (sucesso) {
            
            navigate("/restaurantes-admin");
        } else {
            setErro("Email ou senha inválidos.");
        }

        setLoading(false);
        }
    
  return (
    <div className="flex justify-center items-center min-h-screen bg-claro">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-secundario"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-primario">
          Entrar como Restaurante 🍽️
        </h1>

        {erro && <p className="text-red-500 mb-3 text-center">{erro}</p>}

        <input
          type="email"
          placeholder="E-mail do restaurante"
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
          className="bg-primario text-white font-semibold w-full py-2 rounded hover:bg-destaque hover:text-texto transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/cadastro-restaurante")}
            className="text-primario font-medium ml-1 hover:underline"
          >
            Cadastre seu restaurante
          </button>
        </p>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 hover:text-primario"
          >
            Sou cliente → Fazer login como usuário
          </button>
        </div>
      </form>
    </div>
  );
}