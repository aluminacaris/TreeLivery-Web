import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, senha);
    if (ok) {
      navigate("/");
    } else {
      setErro("Email ou senha inválidos.");
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
          className="bg-primario text-white font-semibold w-full py-2 rounded hover:bg-destaque hover:text-texto transition"
        >
          Entrar
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
      </form>
    </div>
  );
}
