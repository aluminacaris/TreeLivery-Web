import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthRestaurante } from "../context/AuthRestauranteContext";

export default function ProtectedRouteRestaurante({ children }) {
  const { restauranteToken, loadingRestaurante } = useAuthRestaurante();

  if (loadingRestaurante) {
    return (
      <div className="flex justify-center items-center h-screen text-primario font-semibold">
        Carregando...
      </div>
    );
  }

  if (!restauranteToken) {
    return <Navigate to="/login-restaurante" replace />;
  }

  return children;
}
