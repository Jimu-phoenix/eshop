// Cart data management
let cartItems = [];

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    renderCart();
    updateCartCount();
});

// Load cart from localStorage
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
    } else {
        // Demo data for testing
        cartItems = [
            {
                id: 1,
                name: 'Gaming Laptop',
                category: 'Electronics',
                description: 'High-performance gaming laptop with RTX graphics',
                price: 1299.99,
                quantity: 1,
                image: 'assets/images/laptop.jpg'
            },
            {
                id: 2,
                name: 'JavaScript: The Complete Guide',
                category: 'Books',
                description: 'Comprehensive JavaScript programming guide',
                price: 45.99,
                quantity: 2,
                image: 'assets/images/book.jpg'
            },
            {
                id: 3,
                name: 'Smart Microwave Oven',
                category: 'Home Appliances',
                description: 'WiFi-enabled microwave with app control',
                price: 299.99,
                quantity: 1,
                image: 'assets/images/microwave.jpg'
            }
        ];
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Render cart items
function renderCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.querySelector('.cart-summary');

    if (cartItems.length === 0) {
        cartItemsList.style.display = 'none';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        cartItemsList.style.display = 'block';
        emptyCart.style.display = 'none';
        cartSummary.style.display = 'block';

        cartItemsList.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+CjxwYXRoIGQ9Ik0zNSA2NUg2NVY0NUgzNVY2NVpNNDAgNDBINjBWMzVINDBWNDBaIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPgo='">
                </div>
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-category">${item.category}</p>
                    <p class="item-description">${item.description}</p>
                    <div class="item-price">${item.price.toFixed(2)}</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    updateSummary();
}

// Update quantity
function updateQuantity(itemId, change) {
    const item = cartItems.find(i => i.id === itemId);
    
    if (!item) return;

    if (typeof change === 'string') {
        // Direct input change
        const newQuantity = parseInt(change);
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        }
    } else {
        // Button click
        item.quantity += change;
        if (item.quantity < 1) {
            item.quantity = 1;
        }
    }

    saveCartToStorage();
    renderCart();
    updateCartCount();
    showMessage('Cart updated successfully!');
}

// Remove item from cart
function removeItem(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCartToStorage();
    renderCart();
    updateCartCount();
    showMessage('Item removed from cart');
}

// Update cart summary
function updateSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    document.getElementById('summaryItemCount').textContent = itemCount;
    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `${total.toFixed(2)}`;
}

// Update cart count in header
function updateCartCount() {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('itemCount');
    if (countElement) {
        countElement.textContent = itemCount;
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartItems.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }
    
    // Save cart data for checkout page
    localStorage.setItem('checkoutCart', JSON.stringify(cartItems));
    window.location.href = 'checkout.html';
}

// Show success/error message
function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('successMessage');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = text;
    
    if (type === 'error') {
        messageEl.style.backgroundColor = '#e74c3c';
    } else {
        messageEl.style.backgroundColor = '#2ecc71';
    }
    
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Add item to cart (for products page integration)
function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    showMessage('Item added to cart!');
}