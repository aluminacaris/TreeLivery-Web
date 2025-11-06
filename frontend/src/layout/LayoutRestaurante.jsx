// src/layout/Layout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import NavbarRestaurante from "../components/NavbarRestaurante";
import Footer from "../components/Footer";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";

export default function LayoutRestaurante({ protegidoRestaurante = false }) {
  const { token, loading } = useAuthRestaurante();

  // enquanto carrega o estado do usuário (pra não piscar a tela)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primario font-semibold">
        Carregando...
      </div>
    );
  }

  // se for uma rota protegida e não estiver logado, redireciona pro login
  if (protegidoRestaurante && !token) {
    return <Navigate to="/login-restaurante" replace />;
  }

  return (
    <div className="min-h-screen bg-claro text-texto">
      <NavbarRestaurante />
      <main className="p-4 max-w-5xl mx-auto">
        <Outlet /> {/* aqui o React Router renderiza a página */}
      </main>

      <Footer />
    </div>
  );
}
