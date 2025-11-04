import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Menu() {
  const { restauranteId } = useParams()
  const [pratos, setPratos] = useState([])
  const { addToCart } = useCart()

  useEffect(() => {
    axios.get(`http://localhost:8000/restaurantes/${restauranteId}/menu`)
      .then(r => setPratos(r.data))
      .catch(() => {})
  }, [restauranteId])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Cardápio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pratos.map(p => (
          <div key={p.prato_id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{p.nome}</h3>
            <p className="text-gray-600">{p.descricao}</p>
            <p className="mt-2 font-bold text-gray-800">R$ {p.preco}</p>
             <button
              onClick={() => addToCart(p)}
              className="mt-2 bg-verdeclaro text-esc px-3 py-1 rounded hover:bg-marelo transition"
            >Adicionar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
