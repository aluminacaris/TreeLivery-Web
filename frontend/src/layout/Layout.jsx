// src/layout/Layout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Layout({ protegido = false }) {
  const { token, loading } = useAuth();

  // enquanto carrega o estado do usuário (pra não piscar a tela)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primario font-semibold">
        Carregando...
      </div>
    );
  }

  // se for uma rota protegida e não estiver logado, redireciona pro login
  if (protegido && !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-claro text-texto">
      <Navbar />
      <main className="p-4 max-w-5xl mx-auto">
        <Outlet /> {/* aqui o React Router renderiza a página */}
      </main>

      <Footer />
    </div>
  );
}
