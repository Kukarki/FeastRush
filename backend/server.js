const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const Restaurant = require('./models/Restaurant');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ FEASTRUSH DB CONNECTED'))
  .catch((err) => console.log('❌ DB CONNECTION ERROR:', err));

// --- 1. AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created! Please login." });
    } catch (err) {
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'FEASTRUSH_SECRET', { expiresIn: '24h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// --- 2. RESTAURANT & MENU MANAGEMENT ROUTES ---
app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch restaurants" });
    }
});

app.get('/api/restaurants/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: "Not found" });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ message: "Invalid ID format" });
    }
});

// ADMIN: ADD DISH
app.post('/api/restaurants/:id/menu', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        restaurant.menu.push(req.body);
        await restaurant.save();
        res.status(201).json({ message: "Item added successfully" });
    } catch (err) {
        res.status(500).json({ message: "Add failed", error: err.message });
    }
});

// ADMIN: DELETE DISH
app.delete('/api/restaurants/:id/menu/:itemName', async (req, res) => {
    try {
        const { id, itemName } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        restaurant.menu = restaurant.menu.filter(item => item.itemName !== decodeURIComponent(itemName));
        await restaurant.save();
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

// ADMIN: UNIVERSAL UPDATE (Updated to handle Name, Price, Image, and Description)
app.put('/api/restaurants/:id/menu/update', async (req, res) => {
    try {
        const { id } = req.params;
        const { oldItemName, updatedData } = req.body;

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const item = restaurant.menu.find(i => i.itemName === oldItemName);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // Apply updates dynamically based on what the frontend sends
        if (updatedData.itemName) item.itemName = updatedData.itemName;
        if (updatedData.price !== undefined) item.price = updatedData.price;
        if (updatedData.description) item.description = updatedData.description;
        if (updatedData.image) item.image = updatedData.image;

        await restaurant.save();
        res.json({ message: "Menu item updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

// --- 3. ORDER ROUTES ---
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: "Order failed", error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "History failed", error: err.message });
    }
});

// --- 4. DB STATS ROUTE ---
app.get('/api/stats', async (req, res) => {
    try {
        const rCount = await Restaurant.countDocuments();
        const orders = await Order.find();
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        res.json({ 
            restaurants: rCount, 
            orders: orders.length, 
            totalRevenue: totalRevenue,
            dbName: mongoose.connection.name 
        });
    } catch (err) {
        res.status(500).json({ message: "Stats failed" });
    }
});

// --- 5. CRITICAL 404 CATCH-ALL ---
app.use((req, res) => {
    console.log(`❌ 404 Triggered for URL: ${req.url}`);
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));