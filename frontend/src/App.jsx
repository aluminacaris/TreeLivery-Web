import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Layout from "./layout/layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Cadastro from "./pages/Cadastro";
import Restaurantes from "./pages/Restaurantes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Layout padrão (navbar, tema etc.) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Route>

            {/* Layout protegido: só usuários logados acessam */}
            <Route element={<Layout protegido />}>
              <Route path="/restaurantes-admin" element={<Restaurantes />} />
              <Route path="/restaurante/:restauranteId" element={<Menu />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
