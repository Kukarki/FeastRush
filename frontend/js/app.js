import { API } from './api.js';

const container = document.getElementById('app-root');
let cart = {}; 

/**
 * 1. HOME & LANDING VIEW
 */
async function init() {
    const restaurants = await API.getRestaurants();
    const stats = await API.getDbStats();
    const user = JSON.parse(localStorage.getItem('feastrush_user'));

    container.innerHTML = `
        <header class="app-header">
            <h1 class="logo" style="cursor:pointer">FeastRush</h1>
            <div class="header-actions">
                <button id="view-history" class="history-tab-btn">My Orders</button>
                ${user 
                    ? `<div class="user-profile">
                        <span>Hi, <strong>${user.name}</strong></span>
                        <button id="logout-btn" class="logout-link">Logout</button>
                       </div>`
                    : `<button id="header-login-btn" class="login-btn">Login / Sign Up</button>`
                }
            </div>
        </header>

        <section style="background: var(--primary); padding: 60px 5%; text-align: center; color: white; border-radius: 0 0 40px 40px; margin-bottom: 30px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Fast Delivery to Your Door</h1>
            <p>Reliable food options for local students and residents in Kathmandu.</p>
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
                <button id="btn-popular" class="history-tab-btn" style="background: white; color: var(--primary); font-weight: 800;">🔥 Popular</button>
                <button id="btn-students" class="history-tab-btn" style="background: white; color: var(--primary); font-weight: 800;">🎓 Student Deals</button>
            </div>
        </section>

        <section class="db-dashboard">
            <div class="stat-card">
                <small>Database Status</small>
                <strong>${stats ? stats.dbName : 'Offline'} <span class="dot ${stats ? 'green' : 'red'}"></span></strong>
            </div>
            <div class="stat-card"><small>Restaurants</small><strong>${stats ? stats.restaurants : '0'}</strong></div>
            <div class="stat-card"><small>Total Orders</small><strong>${stats ? stats.orders : '0'}</strong></div>
        </section>

        <section class="search-section">
            <input type="text" id="search-input" placeholder="Search for food or restaurants...">
        </section>
        
        <h2 style="padding: 0 5% 15px;">Nearby Restaurants</h2>
        <div class="restaurant-grid" id="restaurant-grid"></div>
    `;

    // RE-BIND EVENT LISTENERS
    document.querySelector('.logo').onclick = init;
    document.getElementById('view-history').onclick = showHistory;
    document.getElementById('btn-popular').onclick = () => showCategory('Popular');
    document.getElementById('btn-students').onclick = () => showCategory('Student');
    
    if (user) {
        document.getElementById('logout-btn').onclick = () => {
            localStorage.clear();
            init();
        };
    } else {
        document.getElementById('header-login-btn').onclick = () => showAuthModal();
    }

    if (restaurants) {
        renderRestaurants(restaurants, document.getElementById('restaurant-grid'));

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filteredData = restaurants.filter(res => {
                    const matchName = res.name && res.name.toLowerCase().includes(term);
                    const matchCuisine = res.cuisine && res.cuisine.toLowerCase().includes(term);
                    const matchMenu = res.menu && res.menu.some(item => 
                        (item.itemName && item.itemName.toLowerCase().includes(term)) || 
                        (item.description && item.description.toLowerCase().includes(term))
                    );
                    return matchName || matchCuisine || matchMenu;
                });
                renderRestaurants(filteredData, document.getElementById('restaurant-grid'));
            });
        }
    }
}

/**
 * 2. CATEGORY VIEW (Student Deals & Popular)
 * Fixed: Back button logic and Real-system discount display
 */
async function showCategory(type) {
    window.scrollTo(0,0);
    const restaurants = await API.getRestaurants();
    
    const filtered = type === 'Student' 
        ? restaurants.filter(r => r.rating >= 4.2) 
        : restaurants.slice(0, 3); 

    container.innerHTML = `
        <div class="menu-view">
            <button id="category-back-btn" class="back-button">← Back to Home</button>
            <h1 style="margin-bottom: 10px;">${type === 'Student' ? '🎓 Exclusive Student Deals' : '🔥 Popular Right Now'}</h1>
            <p style="margin-bottom: 30px; color: gray;">
                ${type === 'Student' ? 'Budget-friendly meals with exclusive discounts for students.' : 'The most ordered meals in Kathmandu this week.'}
            </p>
            <div class="restaurant-grid" id="category-grid"></div>
        </div>
    `;
    
    // Binding the fixed back button
    document.getElementById('category-back-btn').onclick = init;
    
    // Render the grid
    const target = document.getElementById('category-grid');
    filtered.forEach(res => {
        const originalPrice = (res.rating * 5 + 10).toFixed(2); // Simulated high price
        const discountPrice = (originalPrice * 0.85).toFixed(2); // 15% off
        
        const card = document.createElement('div');
        card.className = 'res-card';
        card.innerHTML = `
            <div class="card-img" style="background-image: url('${res.image || ''}')">
                ${type === 'Student' ? `<span class="qty-badge" style="position:absolute; top:10px; right:10px; background:#e74c3c;">15% OFF</span>` : ''}
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3>${res.name}</h3>
                    <span class="rating">⭐ ${res.rating || '4.0'}</span>
                </div>
                <div style="margin: 5px 0;">
                    ${type === 'Student' ? 
                        `<span style="text-decoration: line-through; color: gray; font-size: 0.85rem; margin-right: 8px;">$${originalPrice}</span>
                         <span style="color: #27ae60; font-weight: bold;">$${discountPrice}</span>` : 
                        `<small style="color:gray;">Starting from $8.00</small>`
                    }
                </div>
                <button class="view-btn">View Menu</button>
            </div>
        `;
        card.onclick = () => showMenu(res._id);
        target.appendChild(card);
    });
}

function renderRestaurants(data, target) {
    target.innerHTML = '';
    data.forEach(res => {
        const card = document.createElement('div');
        card.className = 'res-card';
        card.innerHTML = `
            <div class="card-img" style="background-image: url('${res.image || ''}')"></div>
            <div class="card-info">
                <div class="card-header">
                    <h3>${res.name}</h3>
                    <span class="rating">⭐ ${res.rating || '4.0'}</span>
                </div>
                <button class="view-btn">View Menu</button>
            </div>
        `;
        card.onclick = () => showMenu(res._id);
        target.appendChild(card);
    });
}

/**
 * 3. MENU & CART VIEW
 */
async function showMenu(id) {
    window.scrollTo(0,0);
    container.innerHTML = '<div class="loader">Loading Menu...</div>';
    const restaurant = await API.getRestaurantDetails(id);
    
    if (!restaurant) {
        container.innerHTML = '<p class="error">Menu could not be loaded.</p><button id="back-error">Go Back</button>';
        document.getElementById('back-error').onclick = init;
        return;
    }

    container.innerHTML = `
        <div class="menu-view">
            <button id="back-home-menu" class="back-button">← Back to Home</button>
            <div class="menu-hero" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${restaurant.image || ''}')">
                <h1>${restaurant.name}</h1>
            </div>
            
            <div class="menu-list">
                ${restaurant.menu.map(item => {
                    const qty = cart[item.itemName] ? cart[item.itemName].quantity : 0;
                    return `
                    <div class="menu-item">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            ${item.image ? `<img src="${item.image}" alt="${item.itemName}" class="item-img">` : ''}
                            <div class="item-details">
                                <h4>${item.itemName}</h4>
                                <p style="font-size: 0.8rem; color: gray;">${item.description || ''}</p>
                                <span class="price">$${item.price}</span>
                            </div>
                        </div>
                        <div class="cart-controls">
                            ${qty > 0 ? `<button class="minus-btn" data-name="${item.itemName}">-</button><span class="qty-badge">${qty}</span>` : ''}
                            <button class="add-btn" data-name="${item.itemName}" data-price="${item.price}">+</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>

            <div id="cart-summary" class="cart-summary">
                <div class="total-row">
                    <span>Items: <strong id="total-qty">0</strong></span>
                    <span>Total: <strong id="total-price">$0.00</strong></span>
                </div>
                <button class="checkout-btn" id="go-checkout">Checkout</button>
            </div>
        </div>
    `;

    document.getElementById('back-home-menu').onclick = init;
    document.getElementById('go-checkout').onclick = () => showCheckout();
    
    document.querySelectorAll('.add-btn').forEach(btn => btn.onclick = (e) => updateCart(e.target.dataset.name, e.target.dataset.price, 1, id));
    document.querySelectorAll('.minus-btn').forEach(btn => btn.onclick = (e) => updateCart(e.target.dataset.name, null, -1, id));
    
    updateCartUI();
}

function showToast(message) {
    const oldToast = document.querySelector('.toast-msg');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateCart(name, price, change, resId) {
    if (!cart[name] && change > 0) cart[name] = { price: parseFloat(price), quantity: 0 };
    if (cart[name]) {
        cart[name].quantity += change;
        if (cart[name].quantity <= 0) delete cart[name];
    }
    if (change > 0) showToast(`${name} added to cart!`);
    showMenu(resId);
}

function updateCartUI() {
    let totalQty = 0, total = 0;
    for (const id in cart) { totalQty += cart[id].quantity; total += cart[id].price * cart[id].quantity; }
    const summary = document.getElementById('cart-summary');
    if (totalQty > 0) {
        summary.classList.add('active');
        document.getElementById('total-qty').innerText = totalQty;
        document.getElementById('total-price').innerText = `$${total.toFixed(2)}`;
    } else {
        summary.classList.remove('active');
    }
}

/**
 * 4. CHECKOUT MODAL WITH MAP
 */
function showCheckout() {
    const userToken = localStorage.getItem('feastrush_token');
    const user = JSON.parse(localStorage.getItem('feastrush_user'));

    if (!userToken) {
        showAuthModal(); 
        return;
    }

    let total = 0; let items = [];
    for (const name in cart) {
        total += cart[name].price * cart[name].quantity;
        items.push({ itemName: name, quantity: cart[name].quantity, price: cart[name].price });
    }

    const modal = document.createElement('div');
    modal.className = 'checkout-overlay';
    modal.innerHTML = `
        <div class="checkout-card" style="max-width: 500px; padding: 25px; position: relative; max-height: 95vh; overflow-y: auto;">
            <h2>Complete Order</h2>
            <div id="map" style="height: 200px; width: 100%; border-radius: 15px; margin: 10px 0; border: 2px solid #eee; z-index: 10;"></div>
            <p style="font-size: 0.8rem; color: #636e72; margin-bottom: 15px; text-align: center;">📍 Drag marker to pinpoint delivery location</p>
            <form id="order-form" class="order-form">
                <input type="text" id="cust-name" value="${user.name}" readonly style="background:#eee">
                <input type="text" id="cust-addr" placeholder="Street Address" required>
                <input type="hidden" id="cust-lat" value="27.7172">
                <input type="hidden" id="cust-lng" value="85.3240">
                <input type="tel" id="cust-phone" placeholder="Phone Number" required>
                <div style="margin: 15px 0; font-size: 1.1rem; display:flex; justify-content:space-between">
                    <span>Total Amount</span><strong>$${total.toFixed(2)}</strong>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button type="submit" class="place-order-btn" style="width: 100%; margin: 0;">Pay $${total.toFixed(2)}</button>
                    <button type="button" id="close-checkout" class="cancel-btn" style="width: 100%; text-align: center; color: var(--primary); text-decoration: underline; background: none; border: none; font-weight: bold; cursor: pointer;">Cancel & Return</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const map = L.map('map').setView([27.7172, 85.3240], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const marker = L.marker([27.7172, 85.3240], { draggable: true }).addTo(map);

    marker.on('dragend', function(e) {
        const coords = marker.getLatLng();
        document.getElementById('cust-lat').value = coords.lat;
        document.getElementById('cust-lng').value = coords.lng;
    });

    document.getElementById('close-checkout').onclick = () => modal.remove();

    document.getElementById('order-form').onsubmit = async (e) => {
        e.preventDefault();
        await API.placeOrder({
            customerName: document.getElementById('cust-name').value,
            address: document.getElementById('cust-addr').value,
            phone: document.getElementById('cust-phone').value,
            location: {
                lat: document.getElementById('cust-lat').value,
                lng: document.getElementById('cust-lng').value
            },
            items: items,
            totalAmount: total
        });
        alert("🎉 Order placed!");
        cart = {}; modal.remove(); init();
    };
}

/**
 * 5. AUTH MODAL
 */
function showAuthModal(isSignup = false) {
    const modal = document.createElement('div');
    modal.className = 'checkout-overlay';
    modal.innerHTML = `
        <div class="checkout-card auth-card">
            <h2>${isSignup ? 'Create Account' : 'Welcome Back'}</h2>
            <form id="auth-form" class="order-form">
                ${isSignup ? `<input type="text" id="auth-name" placeholder="Full Name" required>` : ''}
                <input type="email" id="auth-email" placeholder="Email Address" required>
                <input type="password" id="auth-pass" placeholder="Password" required>
                <button type="submit" class="place-order-btn">${isSignup ? 'Sign Up' : 'Login'}</button>
                <button type="button" id="toggle-auth" class="cancel-btn">${isSignup ? 'Already have an account? Login' : 'New? Sign Up'}</button>
                <button type="button" onclick="this.closest('.checkout-overlay').remove()" class="cancel-btn" style="color:red">Close</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('toggle-auth').onclick = () => { modal.remove(); showAuthModal(!isSignup); };
    document.getElementById('auth-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-pass').value;
        if (isSignup) {
            const name = document.getElementById('auth-name').value;
            const res = await API.signup({ name, email, password });
            if (res.message) { alert("Account created!"); modal.remove(); showAuthModal(false); }
            else alert(res.error || "Signup failed");
        } else {
            const res = await API.login({ email, password });
            if (res.token) {
                localStorage.setItem('feastrush_token', res.token);
                localStorage.setItem('feastrush_user', JSON.stringify(res.user));
                modal.remove(); init();
            } else alert("Login failed");
        }
    };
}

/**
 * 6. ORDER HISTORY
 */
async function showHistory() {
    container.innerHTML = '<div class="loader">Loading history...</div>';
    const orders = await API.getOrderHistory();

    container.innerHTML = `
        <div class="menu-view">
            <button id="history-back-btn" class="back-button">← Back to Home</button>
            <h1 style="margin-bottom: 20px;">Live Order Tracking</h1>
            <div class="history-list" style="display:flex; flex-direction:column; gap:20px;">
                ${orders.length === 0 ? '<p>No history found.</p>' : orders.map(o => `
                    <div class="menu-item" style="flex-direction: column; align-items: flex-start; padding: 25px;">
                        <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px;">
                            <strong>Order ID: ${o._id.slice(-5)}</strong>
                            <span class="qty-badge" style="background: ${o.status === 'Delivered' ? '#2ecc71' : 'var(--primary)'}">${o.status}</span>
                        </div>
                        <div style="width: 100%; height: 10px; background: #eee; border-radius: 10px; margin: 15px 0;">
                            <div style="width: ${o.status === 'Pending' ? '25%' : o.status === 'Preparing' ? '60%' : '100%'}; 
                                        height: 100%; background: #27ae60; border-radius: 10px; transition: 0.5s ease-in-out;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem; color:gray; font-weight: 600;">
                            <span>Order Placed</span><span>Cooking</span><span>Delivered</span>
                        </div>
                        <p style="font-size:0.8rem; color:gray; margin-top: 15px;">Status check at: ${new Date(o.createdAt).toLocaleString()}</p>
                        <hr style="width:100%; margin: 10px 0; opacity:0.1;">
                        <div style="font-weight:bold; color:var(--primary); font-size:1.1rem;">Total Bill: $${o.totalAmount.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('history-back-btn').onclick = init;
}

init();