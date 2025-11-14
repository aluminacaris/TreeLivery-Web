import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AuthRestauranteProvider } from "./context/AuthRestauranteContext";
import { ToastProvider } from "./context/ToastContext";

import Layout from "./layout/Layout";
import LayoutRestaurante from "./layout/LayoutRestaurante";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Cadastro from "./pages/Cadastro";
import Restaurantes from "./pages/Restaurantes";
import LoginRestaurante from "./pages/LoginRestaurante";
import CadastroRestaurante from "./pages/CadastroRestaurante";
import PedidosRestaurante from "./pages/PedidosRestaurante";
import MeusPedidos from "./pages/MeusPedidos";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
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
                <Route path="/meus-pedidos" element={<MeusPedidos />} />
              </Route>
              
              {/* Protegido - restaurante logado */}
              <Route element={<LayoutRestaurante protegidoRestaurante />}>
                <Route path="/restaurantes-admin" element={<Restaurantes />} />
                <Route path="/pedidos-restaurante" element={<PedidosRestaurante />} />
              </Route>
              </Routes>
            </CartProvider>
          </AuthRestauranteProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
