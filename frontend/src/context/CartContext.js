import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        const existingItem = cartItems.find((item) => item.id === product.id);
        if (existingItem) {
            const updatedCartItems = cartItems.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            setCartItems(updatedCartItems);
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        const updatedCartItems = cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        ).filter((item) => item.quantity > 0);
        setCartItems(updatedCartItems);
    };

    const addOneToCart = (productId) => {
        const updatedCartItems = cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ).filter((item) => item.quantity > 0);
        setCartItems(updatedCartItems);
    };

    const removeAllFromCart = (productId) => {
        const updatedCartItems = cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: 0 } : item
        ).filter((item) => item.quantity > 0);
        setCartItems(updatedCartItems);
    };

    // Calculate the total number of items in the cart
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    //Calculate the total price of items in the cart
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, totalItems, totalPrice, addOneToCart, removeAllFromCart }}>
            {children}
        </CartContext.Provider>
    );
};