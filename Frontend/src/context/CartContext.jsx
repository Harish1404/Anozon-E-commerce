import React, {createContext, useEffect, useState} from "react";

export const CartContext = createContext()

export const CartProvider = ({children}) =>{

    const [ cart, setCart] = useState([])

    const addCart = (product) => {
        setCart([...cart, product])
    } 

    const removeCart = (id) =>{
        setCart(cart.filter(item => item.id !== id))
    }

    return (
        <CartContext.Provider value={{addCart, removeCart, cart}}>
            {children}
        </CartContext.Provider >
    );

};