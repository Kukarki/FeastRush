const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

const mockData = [
  {
    name: "Burger House",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add",
    cuisine: "Burgers",
    rating: 4.2,
    deliveryTime: "15-25 min",
    deliveryFee: 2,
    menu: [{ itemName: "Classic Burger", price: 8, description: "Beef patty with cheese" }]
  },
  {
    name: "Feast Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    cuisine: "Pizza",
    rating: 4.7,
    deliveryTime: "25-35 min",
    deliveryFee: 3,
    menu: [{ itemName: "Pepperoni", price: 14, description: "Loaded with pepperoni" }]
  },
  {
    name: "Sushi Zen",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
    cuisine: "Sushi",
    rating: 4.9,
    deliveryTime: "30-45 min",
    deliveryFee: 5,
    menu: [{ itemName: "Salmon Roll", price: 12, description: "Fresh salmon with avocado" }]
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("🌱 Planting initial restaurant data...");
    await Restaurant.deleteMany({}); // Clears the database first
    await Restaurant.insertMany(mockData); // Adds our three restaurants
    console.log("✅ SUCCESS: FeastRush Database Seeded!");
    process.exit();
  })
  .catch(err => {
    console.log("❌ Seeding Error:", err);
    process.exit(1);
  });