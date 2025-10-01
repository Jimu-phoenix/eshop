let globalCart = 0;
let globalUser = 0;
let globalProducts = [];


const buy = async (User, Cart) => {
        try {
            const res = await fetch('http://localhost:7000/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theUser: User,
                    theCart: Cart
                })
            })

            const result = await res.json();
            if(res.ok){
                mes.innerText = "Successfully Bought! Contact: +265 884 560 736 For Delivery Details!"
                mes.setAttribute('id', "success")
                setTimeout(()=>{
                    window.location.href = '/shop';
                }, 3000)
            }
            else{
                mes.innerText = "A Failure Occurred! Please Try again Later!"
                mes.setAttribute('id', "failure")

                }
        } catch (error) {
            console.log("Error: ", error)
        }
    }


const addViews = async () => {
    try {
        const response = await fetch('http://localhost:7000/addView', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({view: 1})
        });
        
        const result = await response.json();
        console.log("Res", response)
        console.log("result", result)

        if (response.ok) {
            console.log('Viewed!')
            let data = document.getElementById('data');
            globalCart = Number.parseInt(data.getAttribute('data-cart-id'))
            globalProducts = Number.parseInt(data.getAttribute('data-products'))
            globalUser = Number.parseInt(data.getAttribute('data-user-id'))
        } else {
            console.log('Not Viewed!')
        }
    } catch (error) {
        console.error('View error:', error);
    } 
}

const getCart = async (cart, btn) => {
    const cartForm = document.getElementById('cart');
    
    
    if (!cartForm) return;
    
     if (cartForm.style.display === 'block') {
         cartForm.style.display = 'none';
         return;
     }

  
    try {
        const response = await fetch(`http://localhost:7000/cart/products/${cart}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        // Clear previous content
        cartForm.innerHTML = "";
        
        if (result.products && result.products.length > 0) {
            // Create a header for the cart
            const cartHeader = document.createElement('div');
            cartHeader.className = 'cart-header';
            cartHeader.innerHTML = `<h3>Your Cart (${result.products.length} items)</h3>`;
            cartForm.appendChild(cartHeader);

            let productsTotal = 0;
            
            // Add each product
            result.products.forEach(el => {
                const productItem = document.createElement('div');
                productItem.className = 'cart-item';
                productItem.innerHTML = `
                    <div class="product-info">
                        <strong>${el.name}</strong>
                        <p>Price: MK${el.price}</p>
                    </div>
                `;
                cartForm.appendChild(productItem);
                
                // Add hidden inputs
                const idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'productIds[]';
                idInput.value = el.id;
                cartForm.appendChild(idInput);
                
                const nameInput = document.createElement('input');
                nameInput.type = 'hidden';
                nameInput.name = 'productNames[]';
                nameInput.value = el.name;
                cartForm.appendChild(nameInput);
                
                const priceInput = document.createElement('input');
                priceInput.type = 'hidden';
                priceInput.name = 'productPrices[]';
                priceInput.value = el.price;
                productsTotal += Number.parseFloat(el.price);
                cartForm.appendChild(priceInput);
                
            });

             const total = document.createElement('p');
                //  total.type = 'hidden';
                //  total.name = 'total';
                 total.innerText = `Total: MK ${productsTotal.toFixed(2)}`;
                 cartForm.appendChild(total);

            

            const checkoutBtn = document.createElement('button');
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            cartForm.appendChild(closeBtn);
            closeBtn.innerText = "Close";
            closeBtn.id = "close" 
            closeBtn.addEventListener('click', ()=>{
                 cartForm.style.display = 'none';
            })
            checkoutBtn.textContent = 'Proceed to Order';
            checkoutBtn.className = 'checkout primary';
            cartForm.addEventListener('submit', (e) => {
                e.preventDefault();
                let confirm = document.getElementsByClassName('check-cover')[0];
                confirm.style.display = 'flex';
                let placed = document.getElementsByClassName('cover')[0]

                confirm.addEventListener('submit', (e)=>{
                    e.preventDefault()

                    let street = e.target.input1.value
                    let city = e.target.input2.value
                    let pnumber = e.target.input3.value
                    let email = e.target.input4.value

                    if(street && city && pnumber && email){
                        placed.style.display = 'flex'
                    
                        buy(globalUser, globalCart);

                        setTimeout(()=>{
                        window.location.href = '/shop';
                        }, 3000)
                    }
                    else{
                        console.log("Fill");
                    }
                    
                })

                


                // document.getElementById('cancel').addEventListener('click', ()=>{
                    
                //     conf.style.display = 'none';
                // })

                // document.getElementById('confirm').addEventListener('click', ()=>{
                //     console.log('Clicked')
                //     console.log("User:", globalUser, "Cart:", globalCart)
                //     let mes = document.getElementsByClassName('message')[0]
                    
                // })

                console.log("Total: ", productsTotal)
                
            });
            cartForm.appendChild(checkoutBtn);
            
        } else {
            cartForm.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        }
        
        
       cartForm.style.display = 'block';
       
        
    } catch (error) {
        console.error('Cart error:', error);
        cartForm.innerHTML = '<p class="error">Error loading cart</p>';
        cartForm.style.display = 'block';
    }
}

const logout = async () => {
    try {
        const res = await fetch('http://localhost:7000/logout', {
            method: 'POST',
        })
        if (res.ok){
            window.location.href = '/auth'
        }
    } catch (error) {
        console.log('Error:', error)
    }
}

// Add to cart function
async function addToCart(productId, userId, cartId = 0) {
    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: parseInt(productId),
                userId: parseInt(userId),
                cartId: parseInt(cartId) || 0
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Product added to cart!', 'success');
            
            // Update cart ID if it was created
            if (result.cartId && (!cartId || cartId === 0)) {
                updateCartIdInForms(result.cartId);
                globalCart = result.cartId; // Update global cart variable
            }
            
            updateCartUI(productId, result.action);
            
            return result;
        } else {
            showNotification('Error: ' + result.error, 'error');
            return result;
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart', 'error');
        return { success: false, error: 'Network error' };
    }
}

// Helper function to update cart ID in all forms
function updateCartIdInForms(newCartId) {
    const cartIdInputs = document.querySelectorAll('input[name="cartId"]');
    cartIdInputs.forEach(input => {
        input.value = newCartId;
    });
    console.log('Updated cart ID to:', newCartId);
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Helper function to update UI after adding to cart
function updateCartUI(productId, action) {
    if (action === 'added') {
        // Find the button for this product and update it
        const buttons = document.querySelectorAll(`[data-product-id="${productId}"]`);
        buttons.forEach(button => {
            if (button.classList.contains('add-to-cart-btn')) {
                button.textContent = 'Added to Cart';
                button.disabled = true;
                button.style.backgroundColor = '#4CAF50';
            }
        });
    }
}

// Function to handle form submissions
function handleAddToCartFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const productId = Number.parseInt(form.elements.productId.value);
    const userId = Number.parseInt(form.elements.userId.value);
    const cartId = Number.parseInt(form.elements.cartId.value);
    
    globalCart = cartId;

    console.log('Add to cart clicked');
    console.log('Product ID:', productId, 'User ID:', userId, 'Cart ID:', cartId);
    
    // Call the addToCart function
    addToCart(productId, userId, cartId);
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Add to cart forms
    document.querySelectorAll('.hiddenForm').forEach(form => {
        form.addEventListener('submit', handleAddToCartFormSubmit);
    });
    
    // Open cart button
    const openCartBtn = document.getElementById('opencart');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            if (globalCart > 0) {
                getCart(globalCart, openCartBtn);
            } else {
                showNotification('No cart available', 'error');
            }
        });
    }
    
    // Initialize any add-to-cart buttons that might be outside forms
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        const cartId = this.getAttribute('data-cart-id') || globalCart || 0;
        globalCart = cartId;
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            const userId = this.getAttribute('data-user-id');
            
            
            addToCart(productId, userId, cartId);
        });
    });
});

// Initialize views when script loads
addViews();