// Shared utility functions for cart system

// API Configuration
const API_BASE_URL = '/api'; // Change this to your actual API base URL

// API Helper Functions
const API = {
    // Get all products
    getProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    },

    // Get user's cart
    getCart: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    // Add item to cart
    addToCart: async (userId, productId, quantity) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, productId, quantity })
            });
            if (!response.ok) throw new Error('Failed to add to cart');
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    // Update cart item quantity
    updateCartItem: async (itemId, quantity) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId, quantity })
            });
            if (!response.ok) throw new Error('Failed to update cart');
            return await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to remove from cart');
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    // Create order
    createOrder: async (orderData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) throw new Error('Failed to create order');
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Get order tracking
    getOrderTracking: async (orderId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/track/${orderId}`);
            if (!response.ok) throw new Error('Failed to fetch tracking');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tracking:', error);
            throw error;
        }
    },

    // Get user orders
    getUserOrders: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
};

// Local Storage Helper Functions
const Storage = {
    // Get item from localStorage
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set item in localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Validation Helper Functions
const Validator = {
    // Validate email
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate Malawi phone number
    phone: (phone) => {
        // Accepts formats: +265999123456, 0999123456, 999123456
        const re = /^(\+265|0)?[0-9]{9}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    // Validate credit card number (basic Luhn algorithm)
    creditCard: (cardNumber) => {
        const number = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(number)) return false;

        let sum = 0;
        let isEven = false;

        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    },

    // Validate expiry date
    expiryDate: (expiry) => {
        const [month, year] = expiry.split('/');
        if (!month || !year) return false;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expiryMonth = parseInt(month);
        const expiryYear = parseInt(year);

        if (expiryMonth < 1 || expiryMonth > 12) return false;
        if (expiryYear < currentYear) return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

        return true;
    },

    // Validate CVV
    cvv: (cvv) => {
        return /^\d{3,4}$/.test(cvv);
    },

    // Validate required field
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
};

// Formatting Helper Functions
const Formatter = {
    // Format currency
    currency: (amount) => {
        return '$' + parseFloat(amount).toFixed(2);
    },

    // Format date
    date: (dateString, includeTime = false) => {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString('en-US', options);
    },

    // Format phone number
    phone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 9) {
            return `+265 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        return phone;
    },

    // Format card number
    cardNumber: (number) => {
        return number.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || number;
    },

    // Truncate text
    truncate: (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    }
};

// Calculate Helper Functions
const Calculator = {
    // Calculate cart subtotal
    subtotal: (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Calculate tax
    tax: (subtotal, taxRate = 0.05) => {
        return subtotal * taxRate;
    },

    // Calculate shipping
    shipping: (subtotal, method = 'standard') => {
        if (subtotal > 100) return 0; // Free shipping over $100

        const rates = {
            'standard': 0,
            'express': 10,
            'sameDay': 25
        };

        return rates[method] || 0;
    },

    // Calculate total
    total: (subtotal, tax, shipping) => {
        return subtotal + tax + shipping;
    },

    // Calculate item count
    itemCount: (items) => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Calculate delivery date
    deliveryDate: (method = 'standard') => {
        const date = new Date();
        const days = {
            'standard': 7,
            'express': 3,
            'sameDay': 1
        };

        date.setDate(date.getDate() + (days[method] || 7));
        return date.toISOString();
    }
};

// User Authentication Helper
const Auth = {
    // Get current user
    getCurrentUser: () => {
        return Storage.get('currentUser');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!Storage.get('currentUser');
    },

    // Set current user
    setCurrentUser: (user) => {
        return Storage.set('currentUser', user);
    },

    // Logout
    logout: () => {
        Storage.remove('currentUser');
        Storage.remove('cartItems');
        window.location.href = 'login.html';
    }
};

// Notification Helper
const Notify = {
    // Show success notification
    success: (message) => {
        showNotification(message, 'success');
    },

    // Show error notification
    error: (message) => {
        showNotification(message, 'error');
    },

    // Show info notification
    info: (message) => {
        showNotification(message, 'info');
    }
};

// Generic notification function
function showNotification(message, type = 'success') {
    const messageEl = document.getElementById('successMessage');
    const messageText = document.getElementById('messageText');

    if (!messageEl || !messageText) return;

    messageText.textContent = message;

    const colors = {
        'success': '#2ecc71',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };

    messageEl.style.backgroundColor = colors[type] || colors.success;
    messageEl.classList.add('show');

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API,
        Storage,
        Validator,
        Formatter,
        Calculator,
        Auth,
        Notify
    };
}