// src/pages/CadastroRestaurante.jsx
import React, { useState } from "react";
import axios from "axios";  
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

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
        foto_perfil: null,
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
    
    const [previewFoto, setPreviewFoto] = useState(null);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { success, error } = useToast();

    function handleChange(e) {
        const { name, value, files } = e.target;
        
        // Verifica se é upload de arquivo
        if (name === "foto_perfil" && files && files[0]) {
            const file = files[0];
            
            // Validação de tipo de arquivo
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                error("Por favor, selecione uma imagem válida (JPG, PNG, GIF ou WEBP).");
                e.target.value = ''; // Limpa o input
                return;
            }
            
            // Validação de tamanho (máximo 5MB)
            const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
            if (file.size > tamanhoMaximo) {
                error("A imagem deve ter no máximo 5MB. Por favor, escolha uma imagem menor.");
                e.target.value = ''; // Limpa o input
                return;
            }
            
            setForm(prev => ({
                ...prev,
                foto_perfil: file
            }));
            
            // Cria preview da imagem
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
        // Verifica se o campo pertence ao endereço
        else if (name.startsWith("endereco.")) {
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

    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validarCEP(cep) {
        const re = /^\d{5}-?\d{3}$/;
        return re.test(cep.replace(/\D/g, ''));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Validações
        if (!form.nome_fantasia.trim()) {
            error("Por favor, informe o nome fantasia.");
            return;
        }

        if (!form.razao_social.trim()) {
            error("Por favor, informe a razão social.");
            return;
        }

        if (!form.email.trim()) {
            error("Por favor, informe o email.");
            return;
        }

        if (!validarEmail(form.email)) {
            error("Por favor, informe um email válido.");
            return;
        }

        if (!form.senha) {
            error("Por favor, informe uma senha.");
            return;
        }

        if (form.senha.length < 3) {
            error("A senha deve ter pelo menos 3 caracteres.");
            return;
        }

        if (!form.endereco.cep.trim()) {
            error("Por favor, informe o CEP.");
            return;
        }

        if (!validarCEP(form.endereco.cep)) {
            error("Por favor, informe um CEP válido.");
            return;
        }

        if (!form.endereco.logradouro.trim()) {
            error("Por favor, informe o logradouro.");
            return;
        }

        if (!form.endereco.numero.trim()) {
            error("Por favor, informe o número.");
            return;
        }

        if (!form.endereco.bairro.trim()) {
            error("Por favor, informe o bairro.");
            return;
        }

        if (!form.endereco.cidade.trim()) {
            error("Por favor, informe a cidade.");
            return;
        }

        if (!form.endereco.estado.trim()) {
            error("Por favor, informe o estado.");
            return;
        }

        setLoading(true);

        try {
            // Cria FormData para enviar dados + arquivo
            const formData = new FormData();
            formData.append("nome_fantasia", form.nome_fantasia);
            formData.append("razao_social", form.razao_social);
            formData.append("email", form.email);
            formData.append("senha", form.senha);
            if (form.descricao) formData.append("descricao", form.descricao);
            if (form.telefone) formData.append("telefone", form.telefone);
            if (form.tempo_medio_entrega) formData.append("tempo_medio_entrega", form.tempo_medio_entrega);
            if (form.taxa_entrega_base) formData.append("taxa_entrega_base", form.taxa_entrega_base);
            
            // Endereço
            formData.append("cep", form.endereco.cep);
            formData.append("logradouro", form.endereco.logradouro);
            formData.append("numero", form.endereco.numero);
            formData.append("bairro", form.endereco.bairro);
            formData.append("cidade", form.endereco.cidade);
            formData.append("estado", form.endereco.estado);
            if (form.endereco.complemento) formData.append("complemento", form.endereco.complemento);
            
            // Foto de perfil (se houver)
            if (form.foto_perfil) {
                formData.append("foto_perfil", form.foto_perfil);
            }

            await axios.post("http://localhost:8000/restaurantes/registro", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            success("Restaurante cadastrado com sucesso!");
            setTimeout(() => navigate("/login-restaurante"), 1500);
        } catch (err) {
            console.error("❌ Erro ao cadastrar restaurante:", err);
            const errorMsg = err.response?.data?.detail || "Erro ao cadastrar. Verifique os dados e tente novamente.";
            error(errorMsg);
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

                {/* Campo de Foto de Perfil */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto de Perfil (Opcional)
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="file"
                                name="foto_perfil"
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primario text-sm"
                            />
                        </div>
                        {previewFoto && (
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primario">
                                <img 
                                    src={previewFoto} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: JPG, PNG, GIF. Tamanho recomendado: 400x400px
                    </p>
                </div>

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