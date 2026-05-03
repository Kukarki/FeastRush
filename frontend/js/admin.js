// 1. THE BOUNCER: Kick them out immediately if they haven't logged in
if (sessionStorage.getItem('feast_admin_auth') !== 'true') {
    window.location.href = 'admin-login.html';
}

import { API } from './api.js';
import { AdminAPI } from './admin.api.js'; 

const root = document.getElementById('admin-root');

/**
 * 1. INITIALIZE ADMIN DATA (FETCHES ALL RESTAURANTS)
 */
async function initAdmin() {
    try {
        const restaurants = await API.getRestaurants(); // Fetches all 4 restaurants
        const stats = await API.getDbStats() || { totalRevenue: 0, orders: 0, restaurants: 0 };
        
        if (!restaurants || restaurants.length === 0) {
            root.innerHTML = `<p style="color:white; text-align:center; margin-top: 50px;">Error: No restaurants found in database.</p>`;
            return;
        }

        renderDashboard(stats, restaurants);
    } catch (err) {
        console.error("Dashboard Load Error:", err);
        root.innerHTML = `<p style="color:white; text-align:center; margin-top: 50px;">Connection Error. Check Backend.</p>`;
    }
}

/**
 * 2. RENDER THE SECURE DASHBOARD
 */
function renderDashboard(stats, allRestaurants) {
    const liveRevenue = (stats && stats.totalRevenue) ? stats.totalRevenue.toFixed(2) : "0.00";
    const liveOrders = (stats && stats.orders) ? stats.orders : 0;

    root.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; padding: 10px;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; border-bottom: 4px solid #27ae60;">
                <h4 style="color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase;">Total Revenue</h4>
                <h2 style="color: #2c3e50; font-size: 2.2rem; margin: 0;">$${liveRevenue}</h2>
                <span style="color: #27ae60; font-size: 0.8rem; font-weight: bold;">Live Data</span>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; border-bottom: 4px solid #e74c3c;">
                <h4 style="color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase;">Total Orders</h4>
                <h2 style="color: #2c3e50; font-size: 2.2rem; margin: 0;">${liveOrders}</h2>
                <span style="color: #e74c3c; font-size: 0.8rem; font-weight: bold;">System Wide</span>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; border-bottom: 4px solid #f39c12;">
                <h4 style="color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase;">Active Partners</h4>
                <h2 style="color: #2c3e50; font-size: 2.2rem; margin: 0;">${allRestaurants.length}</h2>
                <span style="color: #7f8c8d; font-size: 0.8rem;">Restaurants</span>
            </div>
        </div>

        <h1 style="color: white; margin: 40px 0 20px; text-align: center; font-family: sans-serif;">Menu Management Central</h1>

        ${allRestaurants.map(res => `
            <div class="restaurant-block" style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; margin-bottom: 50px; border: 1px solid #444;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--primary); padding-bottom: 10px;">
                    <h2 style="color: white; margin: 0;">🏠 ${res.name}</h2>
                    <span style="color: #bbb; font-size: 0.9rem;">ID: ${res._id.slice(-6)}</span>
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-top:0;">➕ Add Dish to ${res.name}</h4>
                    <form class="add-dish-form" data-res-id="${res._id}" style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <input type="text" class="new-name" placeholder="Name" required style="flex: 1; padding: 8px;">
                        <input type="number" class="new-price" placeholder="Price" step="0.01" required style="width: 80px; padding: 8px;">
                        <input type="text" class="new-desc" placeholder="Description" required style="flex: 2; padding: 8px;">
                        <input type="url" class="new-img" placeholder="Image URL" required style="flex: 1; padding: 8px;">
                        <button type="submit" style="background: var(--primary); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Add</button>
                    </form>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${res.menu.map(item => `
                        <div class="admin-menu-item" style="background: white; padding: 12px 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <img src="${item.image}" alt="${item.itemName}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover;">
                                <div>
                                    <strong style="color: #2d3436; display: block;">${item.itemName}</strong>
                                    <span style="color: #27ae60; font-weight: bold;">$${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 10px;">
                                <button class="universal-update-btn" 
                                        data-id="${res._id}" 
                                        data-name="${item.itemName}" 
                                        style="color: #27ae60; font-size: 0.8rem; font-weight: bold; background: none; border: 1px solid #27ae60; padding: 5px 10px; border-radius: 6px; cursor: pointer;">
                                    Update Item
                                </button>
                                <button class="delete-dish-btn" 
                                        data-id="${res._id}"
                                        data-name="${item.itemName}" 
                                        style="color: #e74c3c; font-size: 0.8rem; font-weight: bold; background: none; border: 1px solid #e74c3c; padding: 5px 10px; border-radius: 6px; cursor: pointer;">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).reverse().join('')} 
                </div>
            </div>
        `).join('')}
    `;

    /** * EVENT LISTENERS 
     */

    // 1. Add Dish (Handling multiple forms)
    document.querySelectorAll('.add-dish-form').forEach(form => {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const resId = e.target.dataset.resId;
            const newDish = {
                itemName: e.target.querySelector('.new-name').value,
                price: parseFloat(e.target.querySelector('.new-price').value),
                description: e.target.querySelector('.new-desc').value,
                image: e.target.querySelector('.new-img').value
            };
            const success = await AdminAPI.addMenuItem(resId, newDish);
            if (success) { alert(`✅ Added to ${resId.slice(-4)}`); initAdmin(); }
        };
    });

    // 2. Delete Dish
    document.querySelectorAll('.delete-dish-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const resId = e.target.dataset.id;
            const dishName = e.target.dataset.name;
            if (confirm(`Delete ${dishName}?`)) {
                const success = await AdminAPI.deleteMenuItem(resId, dishName);
                if (success) initAdmin();
            }
        };
    });

    // 3. Universal Update (Name, Price, Image, Description)
    document.querySelectorAll('.universal-update-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const resId = e.target.dataset.id;
            const oldName = e.target.dataset.name;
            
            const fieldChoice = prompt("What would you like to update? (name, price, image, description)").toLowerCase();
            
            if (['name', 'price', 'image', 'description'].includes(fieldChoice)) {
                const newValue = prompt(`Enter new ${fieldChoice}:`);
                if (newValue !== null && newValue.trim() !== "") {
                    const updatedData = {};
                    
                    if (fieldChoice === 'name') updatedData.itemName = newValue;
                    else if (fieldChoice === 'price') updatedData.price = parseFloat(newValue);
                    else updatedData[fieldChoice] = newValue;

                    const success = await AdminAPI.updateMenuItem(resId, oldName, updatedData);
                    if (success) {
                        alert("✅ Item updated successfully!");
                        initAdmin();
                    } else {
                        alert("❌ Update failed.");
                    }
                }
            } else if (fieldChoice) {
                alert("Invalid choice. Please type name, price, image, or description.");
            }
        };
    });
}

initAdmin();