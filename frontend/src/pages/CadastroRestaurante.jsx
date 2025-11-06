// src/pages/CadastroRestaurante.jsx
import React, { useState } from "react";
import axios from "axios";  
import { useNavigate } from "react-router-dom";

export default function CadastroRestaurante() {
    const [form, setForm] = useState({
        nome_fantasia: "",
        razao_social: "",
        email: "",
        senha: "",
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

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        
        // Verifica se o campo pertence ao endereço
        if (name.startsWith("endereco.")) {
            const enderecoField = name.split(".")[1];
            setForm(prev => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    [enderecoField]: value
                }
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            // Converte valores numéricos
            const payload = {
                ...form,
                tempo_medio_entrega: form.tempo_medio_entrega ? parseInt(form.tempo_medio_entrega) : null,
                taxa_entrega_base: form.taxa_entrega_base ? parseFloat(form.taxa_entrega_base) : null
            };

            await axios.post("http://localhost:8000/restaurantes/registro", payload);
            alert("Restaurante cadastrado com sucesso!");
            navigate("/login-restaurante");
        } catch (err) {
            console.error("❌ Erro ao cadastrar restaurante:", err);
            alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-claro py-8">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl"
            >
                <h2 className="text-2xl font-bold text-center text-esc mb-6">
                    Cadastrar Restaurante 🍽️
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="nome_fantasia"
                        placeholder="Nome Fantasia"
                        value={form.nome_fantasia}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        required
                    />

                    <input
                        type="text"
                        name="razao_social"
                        placeholder="Razão Social"
                        value={form.razao_social}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        required
                    />

                    <input
                        type="password"
                        name="senha"
                        placeholder="Senha"
                        value={form.senha}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="telefone"
                        placeholder="Telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                    />

                    <input
                        type="number"
                        name="tempo_medio_entrega"
                        placeholder="Tempo Médio de Entrega (minutos)"
                        value={form.tempo_medio_entrega}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="number"
                        step="0.01"
                        name="taxa_entrega_base"
                        placeholder="Taxa de Entrega Base (R$)"
                        value={form.taxa_entrega_base}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                    />
                </div>

                <div className="mb-4">
                    <textarea
                        name="descricao"
                        placeholder="Descrição do Restaurante"
                        value={form.descricao}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        rows={3}
                    />
                </div>

                {/* Seção de Endereço */}
                <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-3 text-primario">📌 Endereço</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="endereco.cep"
                            placeholder="CEP"
                            value={form.endereco.cep}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                        />

                        <input
                            type="text"
                            name="endereco.logradouro"
                            placeholder="Logradouro"
                            value={form.endereco.logradouro}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                        />

                        <input
                            type="text"
                            name="endereco.numero"
                            placeholder="Número"
                            value={form.endereco.numero}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                        />

                        <input
                            type="text"
                            name="endereco.bairro"
                            placeholder="Bairro"
                            value={form.endereco.bairro}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                        />

                        <input
                            type="text"
                            name="endereco.cidade"
                            placeholder="Cidade"
                            value={form.endereco.cidade}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                        />

                        <input
                            type="text"
                            name="endereco.estado"
                            placeholder="Estado (UF)"
                            value={form.endereco.estado}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                            required
                            maxLength={2}
                        />

                        <input
                            type="text"
                            name="endereco.complemento"
                            placeholder="Complemento"
                            value={form.endereco.complemento}
                            onChange={handleChange}
                            className="w-full md:col-span-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primario text-white font-semibold py-2 rounded-lg hover:bg-destaque hover:text-texto transition disabled:opacity-50"
                >
                    {loading ? "Cadastrando..." : "Cadastrar Restaurante"}
                </button>

                <p className="text-center text-sm mt-4">
                    Já tem cadastro?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login-restaurante")}
                        className="text-primario hover:underline"
                    >
                        Fazer Login
                    </button>
                </p>
            </form>
        </div>
    );
}