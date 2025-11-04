import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext(); //compartilha estado entre componentes

export function CartProvider({ children }){ //fornece contexto p/ aplicação //children é o prop q recebe componentes filhos
    const[cartItems, setCartItems] = useState([])

    // add item ou soma se ja existir
    function addToCart(prato){
        setCartItems(prev => {
            const existing = prev.find(p => p.prato_id === prato.prato_id)
            if (existing){
                return prev.map(p =>
                    p.prato_id === prato.prato_id? { ...p, quantity: p.quantity + 1 } : p
                )
            }
            return [...prev, { ...prato, quantity: 1 }]
        })
    }

    function removeFromCart(pratoId){
        setCartItems(prev => prev.filter(p => p.prato_id !== pratoId))
    }

    function clearCart(){
        setCartItems([])
    }

    //reduce calculao total somando preco * quantidade //converte preco pra num caso seja string //valor inicial 0
    const total = cartItems.reduce((acc, p) => acc + Number(p.preco) * p.quantity, 0)

    return( //provider envolve children p/ fornecer contexto // value = obj com todos os dados e funcs disponiveis no context
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, total }}> 
            {children}
        </CartContext.Provider>
    )
}

export function useCart(){
    return useContext(CartContext)
}