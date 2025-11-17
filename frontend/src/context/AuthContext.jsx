import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = "http://localhost:8000";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const fetchUser = async () => {
        await carregarUsuario();
      };
      fetchUser();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setUsuario(null);
      setLoading(false);
    }
  }, [token]);

  async function carregarUsuario() {
    console.log("📡 Chamando /usuarios/me...");
    try {
      const response = await axios.get(`${API_URL}/usuarios/me`);
      console.log("✅ Resposta do /me:", response.data);
      setUsuario(response.data);
    } catch (err) {
      console.error("❌ Erro ao carregar usuário:", err);
      setToken(null);
      localStorage.removeItem("token");
      return;
    } finally {
      setLoading(false);
    }
  }

  function atualizarUsuario(dados) {
    setUsuario((prev) => ({ ...prev, ...dados }));
  }

  async function login(email, senha) {
    console.log("🚀 Tentando login com:", email);
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", senha);

      const response = await axios.post(`${API_URL}/usuarios/login`, form);
      const accessToken = response.data.access_token;

      console.log("🟢 Resposta da API:", response.data);

      setToken(accessToken);
      localStorage.setItem("token", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      await carregarUsuario();
      return true;
    } catch (err) {
      console.error("❌ Erro ao fazer login:", err);
      return false;
    }
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, carregarUsuario, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
