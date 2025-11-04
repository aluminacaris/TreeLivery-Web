import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/menu'
import { CartProvider } from './context/CartContext'

export default function App() {
  return (
    // CartProvider envolve a aplicação p/ fornecer contexto do carrinho para todos os componentes abaixo
    <CartProvider> 
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurante/:restauranteId" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  </CartProvider>
  )
}
