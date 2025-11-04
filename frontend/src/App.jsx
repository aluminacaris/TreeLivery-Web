import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/menu'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurante/:restauranteId" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  )
}
