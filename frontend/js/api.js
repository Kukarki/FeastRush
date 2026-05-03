const BASE_URL = 'http://localhost:5000/api';

export const API = {
    async getRestaurants() {
        try { const res = await fetch(`${BASE_URL}/restaurants`); return await res.json(); } 
        catch (e) { return null; }
    },
    async getRestaurantDetails(id) {
        try { const res = await fetch(`${BASE_URL}/restaurants/${id}`); return await res.json(); } 
        catch (e) { return null; }
    },
    async placeOrder(orderData) {
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error("Order failed");
        return await res.json();
    },
    async getOrderHistory() {
        const res = await fetch(`${BASE_URL}/orders`);
        if (!res.ok) return [];
        return await res.json();
    },
    async getDbStats() {
        try { const res = await fetch(`${BASE_URL}/stats`); return await res.json(); } 
        catch (e) { return null; }
    },
    async signup(userData) {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await res.json();
    },
    async login(credentials) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await res.json();
    }
};