// Order data
let orderData = null;

// Initialize confirmation page
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    displayOrderDetails();
    showSuccessMessage();
});

// Load order data from localStorage
function loadOrderData() {
    const storedOrder = localStorage.getItem('currentOrder');
    if (storedOrder) {
        orderData = JSON.parse(storedOrder);
    } else {
        // Demo order data for testing
        orderData = {
            orderNumber: 'ORD-2024-001234',
            orderDate: new Date().toISOString(),
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'creditCard',
            shippingMethod: 'standard',
            shippingCost: 0,
            items: [
                {
                    id: 1,
                    name: 'Gaming Laptop',
                    category: 'Electronics',
                    price: 1299.99,
                    quantity: 1,
                    image: 'assets/images/laptop.jpg'
                },
                {
                    id: 2,
                    name: 'JavaScript: The Complete Guide',
                    category: 'Books',
                    price: 45.99,
                    quantity: 2,
                    image: 'assets/images/book.jpg'
                },
                {
                    id: 3,
                    name: 'Smart Microwave Oven',
                    category: 'Home Appliances',
                    price: 299.99,
                    quantity: 1,
                    image: 'assets/images/microwave.jpg'
                }
            ],
            deliveryAddress: {
                firstName: 'John',
                lastName: 'Doe',
                streetAddress: '123 Main Street',
                city: 'Blantyre',
                district: 'blantyre',
                phone: '+265 999 123 456',
                email: 'john.doe@example.com'
            }
        };
    }
}

// Display order details
function displayOrderDetails() {
    // Order number and dates
    document.getElementById('orderNumber').textContent = orderData.orderNumber;
    document.getElementById('orderDate').textContent = formatDate(orderData.orderDate);
    document.getElementById('deliveryDate').textContent = formatDate(orderData.deliveryDate) + ' (estimated)';

    // Payment method
    const paymentMethods = {
        'creditCard': 'Credit Card',
        'mobileMoney': 'Mobile Money',
        'bankTransfer': 'Bank Transfer',
        'cashOnDelivery': 'Cash on Delivery'
    };
    document.getElementById('paymentMethod').textContent = paymentMethods[orderData.paymentMethod] || 'Credit Card';

    // Shipping method
    const shippingMethods = {
        'standard': 'Standard Delivery - Free',
        'express': 'Express Delivery - $10.00',
        'sameDay': 'Same Day Delivery - $25.00'
    };
    document.getElementById('shippingMethod').textContent = shippingMethods[orderData.shippingMethod] || 'Standard Delivery';

    // Delivery address
    if (orderData.deliveryAddress) {
        document.getElementById('customerName').textContent = 
            `${orderData.deliveryAddress.firstName} ${orderData.deliveryAddress.lastName}`;
        document.getElementById('streetAddress').textContent = orderData.deliveryAddress.streetAddress;
        document.getElementById('cityDistrict').textContent = 
            `${orderData.deliveryAddress.city}, ${formatDistrict(orderData.deliveryAddress.district)}`;
        document.getElementById('phone').textContent = orderData.deliveryAddress.phone;
        document.getElementById('email').textContent = orderData.deliveryAddress.email;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format district name
function formatDistrict(district) {
    const districts = {
        'blantyre': 'Blantyre',
        'lilongwe': 'Lilongwe',
        'mzuzu': 'Mzuzu',
        'zomba': 'Zomba',
        'karonga': 'Karonga',
        'kasungu': 'Kasungu',
        'mangochi': 'Mangochi',
        'nsanje': 'Nsanje'
    };
    return districts[district] || district;
}

// Show success message
function showSuccessMessage() {
    const messageEl = document.getElementById('successMessage');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = 'Order placed successfully!';
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Send confirmation email (simulated)
function sendConfirmationEmail() {
    // This would typically make an API call to your backend
    console.log('Sending confirmation email to:', orderData.deliveryAddress.email);
    
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// Schedule delivery notifications (simulated)
function scheduleNotifications() {
    // This would typically make an API call to schedule notifications
    const deliveryDate = new Date(orderData.deliveryDate);
    const twoDaysBefore = new Date(deliveryDate);
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    
    console.log('Scheduling notifications:');
    console.log('2 days before:', twoDaysBefore);
    console.log('Delivery day:', deliveryDate);
}

// Initialize notifications on page load
sendConfirmationEmail();
scheduleNotifications();