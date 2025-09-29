// Tracking data
let trackingData = null;

// Initialize tracking page
document.addEventListener('DOMContentLoaded', function() {
    setupTrackingForm();
    
    // Check if there's a current order to auto-load
    const currentOrder = localStorage.getItem('currentOrder');
    if (currentOrder) {
        const order = JSON.parse(currentOrder);
        document.getElementById('orderNumberInput').value = order.orderNumber;
        loadTrackingInfo(order.orderNumber);
    }
});

// Setup tracking form
function setupTrackingForm() {
    const form = document.getElementById('trackingForm');
    form.addEventListener('submit', handleTrackingSearch);
}

// Handle tracking search
function handleTrackingSearch(e) {
    e.preventDefault();
    
    const orderNumber = document.getElementById('orderNumberInput').value.trim();
    
    if (!orderNumber) {
        showError('Please enter an order number');
        return;
    }
    
    loadTrackingInfo(orderNumber);
}

// Load tracking information
function loadTrackingInfo(orderNumber) {
    // Clear previous error
    document.getElementById('searchError').textContent = '';
    
    // Simulate API call to fetch tracking info
    fetchTrackingData(orderNumber)
        .then(data => {
            trackingData = data;
            displayTrackingResults();
            updateProgress();
            calculateDeliveryCountdown();
            showSuccessMessage('Tracking information loaded successfully!');
        })
        .catch(error => {
            showError('Order not found. Please check your order number and try again.');
        });
}

// Fetch tracking data (simulated API call)
function fetchTrackingData(orderNumber) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if order exists in localStorage
            const storedOrder = localStorage.getItem('currentOrder');
            if (storedOrder) {
                const order = JSON.parse(storedOrder);
                if (order.orderNumber === orderNumber) {
                    resolve(generateTrackingData(order));
                    return;
                }
            }
            
            // Demo tracking data
            if (orderNumber.startsWith('ORD-')) {
                resolve(generateDemoTrackingData(orderNumber));
            } else {
                reject(new Error('Order not found'));
            }
        }, 1000);
    });
}

// Generate tracking data from order
function generateTrackingData(order) {
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(order.deliveryDate);
    const now = new Date();
    
    // Calculate progress
    const totalDuration = deliveryDate - orderDate;
    const elapsed = now - orderDate;
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    // Determine current status
    let currentStatus = 'processing';
    let currentStep = 2;
    
    if (progress > 75) {
        currentStatus = 'in_transit';
        currentStep = 3;
    } else if (progress > 50) {
        currentStatus = 'shipped';
        currentStep = 3;
    } else if (progress > 25) {
        currentStatus = 'processing';
        currentStep = 2;
    } else {
        currentStatus = 'confirmed';
        currentStep = 1;
    }
    
    return {
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        currentStatus: currentStatus,
        currentStep: currentStep,
        progress: progress,
        items: order.items || [],
        deliveryAddress: order.deliveryAddress || {}
    };
}

// Generate demo tracking data
function generateDemoTrackingData(orderNumber) {
    const orderDate = new Date('2024-09-28');
    const deliveryDate = new Date('2024-10-05');
    
    return {
        orderNumber: orderNumber,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        currentStatus: 'in_transit',
        currentStep: 3,
        progress: 75,
        items: [
            {
                id: 1,
                name: 'Gaming Laptop',
                quantity: 1,
                image: 'assets/images/laptop.jpg'
            },
            {
                id: 2,
                name: 'JavaScript: The Complete Guide',
                quantity: 2,
                image: 'assets/images/book.jpg'
            },
            {
                id: 3,
                name: 'Smart Microwave Oven',
                quantity: 1,
                image: 'assets/images/microwave.jpg'
            }
        ],
        deliveryAddress: {
            firstName: 'John',
            lastName: 'Doe',
            streetAddress: '123 Main Street',
            city: 'Blantyre',
            district: 'Southern Region',
            phone: '+265 999 123 456'
        }
    };
}

// Display tracking results
function displayTrackingResults() {
    const resultsSection = document.getElementById('trackingResults');
    resultsSection.style.display = 'block';
    
    // Update order information
    document.getElementById('displayOrderNumber').textContent = trackingData.orderNumber;
    document.getElementById('displayOrderDate').textContent = formatDate(trackingData.orderDate);
    document.getElementById('estimatedDelivery').textContent = formatDate(trackingData.deliveryDate);
    
    // Update status badge
    updateStatusBadge();
    
    // Update delivery address
    if (trackingData.deliveryAddress) {
        const fullName = `${trackingData.deliveryAddress.firstName} ${trackingData.deliveryAddress.lastName}`;
        document.getElementById('recipientName').textContent = fullName;
        document.getElementById('deliveryStreet').textContent = trackingData.deliveryAddress.streetAddress;
        document.getElementById('deliveryCity').textContent = trackingData.deliveryAddress.city + ', ' + trackingData.deliveryAddress.district;
        document.getElementById('deliveryPhone').textContent = trackingData.deliveryAddress.phone;
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update status badge
function updateStatusBadge() {
    const statusBadge = document.getElementById('currentStatus');
    const statusText = statusBadge.querySelector('.status-text');
    const statusIcon = statusBadge.querySelector('.status-icon');
    
    const statuses = {
        'confirmed': { text: 'Order Confirmed', icon: '✅', color: '#2ecc71' },
        'processing': { text: 'Processing', icon: '📦', color: '#f39c12' },
        'shipped': { text: 'Shipped', icon: '🚚', color: '#3498db' },
        'in_transit': { text: 'In Transit', icon: '🚚', color: '#3498db' },
        'delivered': { text: 'Delivered', icon: '🏠', color: '#2ecc71' }
    };
    
    const status = statuses[trackingData.currentStatus] || statuses['processing'];
    statusText.textContent = status.text;
    statusIcon.textContent = status.icon;
    statusBadge.style.backgroundColor = status.color;
}

// Update progress tracker
function updateProgress() {
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = trackingData.progress + '%';
    
    // Update progress steps
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('completed', 'active');
        
        if (stepNumber < trackingData.currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === trackingData.currentStep) {
            step.classList.add('active');
        }
    });
}

// Calculate delivery countdown
function calculateDeliveryCountdown() {
    const deliveryDate = new Date(trackingData.deliveryDate);
    const now = new Date();
    const diffTime = deliveryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const countdownEl = document.getElementById('deliveryCountdown');
    
    if (diffDays > 0) {
        countdownEl.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
        countdownEl.style.color = '#2ecc71';
    } else if (diffDays === 0) {
        countdownEl.textContent = 'Arriving today!';
        countdownEl.style.color = '#f39c12';
    } else {
        countdownEl.textContent = 'Delivery date passed';
        countdownEl.style.color = '#e74c3c';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('searchError');
    errorEl.textContent = message;
    
    const resultsSection = document.getElementById('trackingResults');
    resultsSection.style.display = 'none';
}

// Show success message
function showSuccessMessage(text) {
    const messageEl = document.getElementById('successMessage');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = text;
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Check for notifications (2 days before delivery)
function checkNotifications() {
    if (!trackingData) return;
    
    const deliveryDate = new Date(trackingData.deliveryDate);
    const now = new Date();
    const diffTime = deliveryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 2) {
        sendNotification('Your order will arrive in 2 days!');
    } else if (diffDays === 0) {
        sendNotification('Your order is arriving today!');
    }
}

// Send notification (simulated)
function sendNotification(message) {
    console.log('Notification:', message);
    // In a real application, this would send email/SMS
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Update', {
            body: message,
            icon: '/assets/images/logo.png'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Auto-refresh tracking every 5 minutes
setInterval(() => {
    if (trackingData) {
        loadTrackingInfo(trackingData.orderNumber);
    }
}, 5 * 60 * 1000);

// Check notifications on page load
requestNotificationPermission();
checkNotifications();