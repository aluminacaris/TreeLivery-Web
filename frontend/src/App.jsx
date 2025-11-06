import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AuthRestauranteProvider } from "./context/AuthRestauranteContext";

import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Cadastro from "./pages/Cadastro";
import Restaurantes from "./pages/Restaurantes";
import LoginRestaurante from "./pages/LoginRestaurante";
import CadastroRestaurante from "./pages/CadastroRestaurante";
import ProtectedRouteRestaurante from "./components/ProtectedRouteRestaurante"; // 👈 novo

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthRestauranteProvider>
          <CartProvider>
            <Routes>
              {/* Layout padrão (navbar, tema etc.) */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/login-restaurante" element={<LoginRestaurante />} />
                <Route path="/cadastro-restaurante" element={<CadastroRestaurante />} />
              </Route>

              {/* Layout protegido: só usuários logados acessam */} 
              <Route element={<Layout protegido />}> 
                <Route path="/restaurante/:restauranteId" element={<Menu />} /> 
              </Route>
              
              {/* Protegido - restaurante logado */}
              <Route
                path="/restaurantes-admin"
                element={
                  <ProtectedRouteRestaurante>
                    <Restaurantes />
                  </ProtectedRouteRestaurante>
                }
              />
            </Routes>
          </CartProvider>
        </AuthRestauranteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
