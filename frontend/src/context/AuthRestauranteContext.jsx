// src/context/AuthRestauranteContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthRestauranteContext = createContext();

export function AuthRestauranteProvider({ children }) {
  const [restaurante, setRestaurante] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("restaurante_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      carregarRestaurante();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setRestaurante(null);
      setLoading(false);
    }
  }, [token]);

  async function carregarRestaurante() {
    try {
      const response = await axios.get("http://localhost:8000/restaurantes/me");
      setRestaurante(response.data);
      console.log("🍽️ Restaurante autenticado:", response.data);
    } catch (err) {
      console.error("❌ Erro ao carregar restaurante:", err);
      setToken(null);
      localStorage.removeItem("restaurante_token");
    } finally {
      setLoading(false);
    }
  }

  async function loginRestaurante(email, senha) {
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", senha);

      const response = await axios.post("http://localhost:8000/restaurantes/login", form);
      const accessToken = response.data.access_token;
      setToken(accessToken);
      localStorage.setItem("restaurante_token", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      await carregarRestaurante();
      return true;
    } catch (err) {
      console.error("❌ Erro ao fazer login de restaurante:", err);
      return false;
    }
  }

  function logoutRestaurante() {
    setRestaurante(null);
    setToken(null);
    localStorage.removeItem("restaurante_token");
    delete axios.defaults.headers.common["Authorization"];
  }

  return (
    <AuthRestauranteContext.Provider value={{ restaurante, token, loading, loginRestaurante, logoutRestaurante }}>
      {children}
    </AuthRestauranteContext.Provider>
  );
}

export function useAuthRestaurante() {
  return useContext(AuthRestauranteContext);
}
