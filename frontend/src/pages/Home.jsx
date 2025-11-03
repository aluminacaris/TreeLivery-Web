import React, {useEffect, useState} from 'react'
import axios from 'axios'

function Navbar(){ return (
  <div className="bg-white shadow p-4 flex justify-between items-center">
    <div className="text-xl font-bold">TreeLivery</div>
    <div>Olá, cliente</div>
  </div>
)}

function Card({r}){
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold">{r.nome_fantasia}</h3>
      <p className="text-sm text-gray-600">{r.descricao}</p>
      <div className="mt-2 text-sm text-gray-700">Entrega: {r.tempo_medio_entrega ?? '—'} min • Taxa: R$ {r.taxa_entrega_base ?? '0.00'}</div>
    </div>
  )
}

export default function Home(){
  const [rests, setRests] = useState([])
  useEffect(()=>{ axios.get('http://localhost:8000/restaurantes/').then(r=>setRests(r.data)).catch(()=>{}) },[])
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {rests.map(r=> <Card key={r.restaurante_id} r={r} />)}
      </div>
    </div>
  )
}
