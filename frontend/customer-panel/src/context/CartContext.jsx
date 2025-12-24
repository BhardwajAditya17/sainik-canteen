import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";

// 1. Optional: Import AuthContext if you have one to sync login state
// import { useAuth } from "./AuthContext"; 

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // To store API errors

    // Helper: Get token directly
    const getToken = () => localStorage.getItem("token");

    // Wrapped in useCallback to prevent infinite loops in useEffect
    const fetchCart = useCallback(async () => {
        const token = getToken();
        
        // If no token, we can't fetch the cart. 
        // Reset state to empty (guest mode) and stop loading.
        if (!token) {
            setCart([]);
            setTotal(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get("/cart", { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setCart(res.data.items || []); 
            setTotal(res.data.total || 0);
            setError(null);
        } catch (err) {
            console.error("Cart Fetch Error:", err);
            setError("Failed to load cart");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Effect: Fetch cart on mount. 
    // Tip: If you have an AuthContext, add 'user' or 'token' to this dependency array 
    // to auto-refresh the cart when the user logs in!
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId, quantity = 1) => {
        const token = getToken();
        if (!token) return alert("Please login to add items");

        try {
            await api.post(
                "/cart", 
                { productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Re-fetch to ensure backend calculations (tax, shipping, total) are synced
            await fetchCart(); 
            return { success: true };
        } catch (error) {
            console.error("Add to cart failed:", error);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        const token = getToken();
        if (!token) return;

        try {
            // Optimistic Update (Optional): 
            // Update UI immediately before server responds makes it feel faster.
            // setCart(prev => prev.map(item => item._id === itemId ? {...item, quantity} : item));

            await api.put(
                `/cart/${itemId}`, 
                { quantity }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchCart();
        } catch (error) {
            console.error("Update quantity failed:", error);
            // If optimistic update failed, you would rollback here
        }
    };

    const removeFromCart = async (itemId) => {
        const token = getToken();
        if (!token) return;

        try {
            await api.delete(`/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchCart();
        } catch (error) {
            console.error("Remove from cart failed:", error);
        }
    };

    const clearCart = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await api.delete("/cart", { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Manual update is fine here (and faster) since we know the result is empty
            setCart([]);
            setTotal(0);
        } catch (error) {
            console.error("Clear cart failed:", error);
        }
    };

    return (
        <CartContext.Provider
            value={{ 
                cart, 
                total, 
                loading,
                error, // Exposed so UI can show error messages
                addToCart, 
                updateQuantity, 
                removeFromCart, 
                clearCart,
                fetchCart // Exposed so other components can manually refresh if needed
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);