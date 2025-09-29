// Checkout data
let checkoutData = {
    cartItems: [],
    paymentMethod: 'creditCard',
    shippingMethod: 'standard',
    shippingCost: 0,
    formData: {}
};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutCart();
    setupEventListeners();
    updateOrderSummary();
});

// Load cart items from localStorage
function loadCheckoutCart() {
    const storedCart = localStorage.getItem('checkoutCart') || localStorage.getItem('cartItems');
    if (storedCart) {
        checkoutData.cartItems = JSON.parse(storedCart);
    }
    
    if (checkoutData.cartItems.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Payment method change
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', handlePaymentMethodChange);
    });

    // Shipping method change
    const shippingOptions = document.querySelectorAll('input[name="shippingMethod"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', handleShippingMethodChange);
    });

    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.addEventListener('submit', handleFormSubmit);

    // Card number formatting
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', formatCardNumber);
    }

    // Expiry date formatting
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        expiryDate.addEventListener('input', formatExpiryDate);
    }
}

// Handle payment method change
function handlePaymentMethodChange(e) {
    checkoutData.paymentMethod = e.target.value;
    
    // Hide all payment details
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Show selected payment details
    if (e.target.value === 'creditCard') {
        document.getElementById('creditCardDetails').classList.add('active');
    } else if (e.target.value === 'mobileMoney') {
        document.getElementById('mobileMoneyDetails').classList.add('active');
    }
    
    showMessage('Payment method updated');
}

// Handle shipping method change
function handleShippingMethodChange(e) {
    checkoutData.shippingMethod = e.target.value;
    
    // Update shipping cost
    switch(e.target.value) {
        case 'standard':
            checkoutData.shippingCost = 0;
            break;
        case 'express':
            checkoutData.shippingCost = 10;
            break;
        case 'sameDay':
            checkoutData.shippingCost = 25;
            break;
    }
    
    updateOrderSummary();
    showMessage('Shipping method updated');
}

// Format card number
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\//g, '');
    if (value.length >= 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
}

// Update order summary
function updateOrderSummary() {
    const subtotal = checkoutData.cartItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
    const itemCount = checkoutData.cartItems.reduce((sum, item) => 
        sum + item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + checkoutData.shippingCost + tax;

    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summaryShipping').textContent = 
        checkoutData.shippingCost === 0 ? 'Free' : `$${checkoutData.shippingCost.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
}

// Validate form
function validateForm() {
    let isValid = true;
    const errors = {};

    // Validate delivery address
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const streetAddress = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const district = document.getElementById('district').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!firstName) {
        errors.firstName = 'First name is required';
        isValid = false;
    }
    if (!lastName) {
        errors.lastName = 'Last name is required';
        isValid = false;
    }
    if (!streetAddress) {
        errors.street = 'Street address is required';
        isValid = false;
    }
    if (!city) {
        errors.city = 'City is required';
        isValid = false;
    }
    if (!district) {
        errors.district = 'District is required';
        isValid = false;
    }
    if (!phone || !validatePhone(phone)) {
        errors.phone = 'Valid phone number is required';
        isValid = false;
    }
    if (!email || !validateEmail(email)) {
        errors.email = 'Valid email is required';
        isValid = false;
    }

    // Validate payment details
    if (checkoutData.paymentMethod === 'creditCard') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardHolderName = document.getElementById('cardHolderName').value.trim();

        if (!cardNumber || cardNumber.length < 13) {
            errors.cardNumber = 'Valid card number is required';
            isValid = false;
        }
        if (!expiryDate || !validateExpiry(expiryDate)) {
            errors.expiry = 'Valid expiry date is required';
            isValid = false;
        }
        if (!cvv || cvv.length < 3) {
            errors.cvv = 'Valid CVV is required';
            isValid = false;
        }
        if (!cardHolderName) {
            errors.cardHolder = 'Cardholder name is required';
            isValid = false;
        }
    } else if (checkoutData.paymentMethod === 'mobileMoney') {
        const provider = document.getElementById('mobileProvider').value;
        const mobileNumber = document.getElementById('mobileNumber').value.trim();

        if (!provider) {
            errors.provider = 'Please select a provider';
            isValid = false;
        }
        if (!mobileNumber || !validatePhone(mobileNumber)) {
            errors.mobile = 'Valid phone number is required';
            isValid = false;
        }
    }

    // Display errors
    displayErrors(errors);
    
    return isValid;
}

// Display validation errors
function displayErrors(errors) {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    // Display new errors
    Object.keys(errors).forEach(key => {
        const errorEl = document.getElementById(`${key}Error`);
        if (errorEl) {
            errorEl.textContent = errors[key];
        }
    });
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function validatePhone(phone) {
    const re = /^(\+265|0)?[0-9]{9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Validate expiry date
function validateExpiry(expiry) {
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
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showMessage('Please fix the errors in the form', 'error');
        return;
    }
    
    // Collect form data
    checkoutData.formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        streetAddress: document.getElementById('streetAddress').value.trim(),
        city: document.getElementById('city').value.trim(),
        district: document.getElementById('district').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim()
    };
    
    // Show loading overlay
    document.getElementById('loadingOverlay').classList.add('show');
    
    // Simulate API call
    setTimeout(() => {
        processOrder();
    }, 2000);
}

// Process order
function processOrder() {
    // Generate order number
    const orderNumber = 'ORD-' + new Date().getFullYear() + '-' + 
        String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    
    // Calculate delivery date
    const deliveryDate = new Date();
    switch(checkoutData.shippingMethod) {
        case 'standard':
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            break;
        case 'express':
            deliveryDate.setDate(deliveryDate.getDate() + 3);
            break;
        case 'sameDay':
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            break;
    }
    
    // Store order data
    const orderData = {
        orderNumber: orderNumber,
        orderDate: new Date().toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        items: checkoutData.cartItems,
        paymentMethod: checkoutData.paymentMethod,
        shippingMethod: checkoutData.shippingMethod,
        shippingCost: checkoutData.shippingCost,
        deliveryAddress: checkoutData.formData
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    // Clear cart
    localStorage.removeItem('cartItems');
    localStorage.removeItem('checkoutCart');
    
    // Redirect to confirmation page
    window.location.href = 'order-confirmation.html';
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