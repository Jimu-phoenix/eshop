

const productId = Number.parseInt(document.getElementById('data').getAttribute('data_id'));


const deleteProduct = async (id) => {
    const messageEl = document.getElementById('message');
    const loadingEl = document.getElementById('loading');
    const deleteBtn = document.getElementById('delete-btn');
    
    loadingEl.style.display = 'block';
    deleteBtn.disabled = true;
    messageEl.style.display = 'none';
    
    try {
        const response = await fetch(`/deleteProduct/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        
        loadingEl.style.display = 'none';
        
        if (response.ok) {
            
            messageEl.textContent = data.message || 'Product deleted successfully!';
            messageEl.className = 'message success';
            messageEl.style.display = 'block';
            
           
            setTimeout(() => {
                window.location.href = '/products';
            }, 2000);
        } else {
            // Error from server
            messageEl.textContent = data.error || 'Error deleting product';
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            deleteBtn.disabled = false;
        }
    } catch (error) {
        // Network error
        console.error('Error:', error);
        loadingEl.style.display = 'none';
        messageEl.textContent = 'Network error. Please try again.';
        messageEl.className = 'message error';
        messageEl.style.display = 'block';
        deleteBtn.disabled = false;
    }
};

document.getElementById('delete-btn').addEventListener('click', () => {
    deleteProduct(productId);
});