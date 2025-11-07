import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext(); //compartilha estado entre componentes

export function CartProvider({ children }){ //fornece contexto p/ aplicação //children é o prop q recebe componentes filhos
    const[cartItems, setCartItems] = useState([])

    // add item ou soma se ja existir
function addToCart(item, delta = 1) {
  setCartItems((prev) => {
    const existing = prev.find((p) => p.prato_id === item.prato_id);
    if (existing) {
      const updated = prev
        .map((p) =>
          p.prato_id === item.prato_id
            ? { ...p, quantity: Math.max(1, p.quantity + delta) }
            : p
        )
        .filter((p) => p.quantity > 0);
      return updated;
    }
    if (delta > 0) return [...prev, { ...item, quantity: 1 }];
    return prev;
  });
}

    function removeFromCart(pratoId) {
    setCartItems((prev) => prev.filter((p) => p.prato_id !== pratoId));
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