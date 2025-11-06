import React, { useEffect, useState } from "react";
import axios from "axios";  
import { Navigate, useNavigate } from "react-router-dom";

export default function Cadastro() {
    const [ form, setForm ] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo_dieta: "",
    restricoes: [],
    seletividade: false,    
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

    const [novaRestricao, setNovaRestricao] = useState("");
    const navigate = useNavigate(); 

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }
    
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

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/usuarios/", form);  
            alert("Cadastro realizado com sucesso");
            navigate("/login");
        } catch (err) {
            console.error("❌ Erro ao cadastrar:", err);
            alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
        }
    }

    return(
         <div className="flex justify-center items-center min-h-screen bg-claro">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-esc mb-6">
          Criar conta 🍃
        </h2>

        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <label className="block mb-1 text-sm font-semibold">Tipo de dieta</label>
        <select
          name="tipo_dieta"
          value={form.tipo_dieta}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        >
          <option value="">Selecione</option>
          <option value="vegano">Vegano</option>
          <option value="vegetariano">Vegetariano</option>
          <option value="onivoro">Onívoro</option>
        </select>

<label className="block mb-2 text-sm font-semibold">Restrições alimentares</label>

<div className="flex flex-wrap gap-2 mb-4">
  {restricoesDisponiveis.map((restricao) => {
    const selecionado = form.restricoes.includes(restricao);
    return (
      <button
        key={restricao}
        type="button"
        onClick={() => {
          if (selecionado) {
            setForm((prev) => ({
              ...prev,
              restricoes: prev.restricoes.filter((r) => r !== restricao),
            }));
            console.log("— removido", restricao);
          } else {
            setForm((prev) => ({
              ...prev,
              restricoes: [...prev.restricoes, restricao],
            }));
            console.log("— adicionado", restricao);
          }
        }}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-transform transform
          ${selecionado 
            ? "bg-primario text-white ring-2 ring-primario" 
            : "bg-white text-texto border border-secundario hover:scale-105 hover:bg-destaque hover:border-destaque hover:text-texto"}`}
        aria-pressed={selecionado}
      >
        {restricao.charAt(0).toUpperCase() + restricao.slice(1)}
      </button>
    );
  })}
</div>

{/* Campo para adicionar outra restrição (input + botão) */}
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
        
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="seletividade"
            checked={form.seletividade}
            onChange={handleChange}
          />
          Tenho seletividade alimentar
        </label>

        <button
          type="submit"
          className="w-full bg-primario text-claro font-semibold py-2 rounded-lg hover:text-texto hover:bg-destaque transition"
        >
          Cadastrar
        </button>

        <p className="text-center text-sm mt-4">
          Já tem uma conta?{" "}
          <a href="/login" className="text-primario hover:underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
