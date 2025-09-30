// Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tabs
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update forms
                const tabName = tab.getAttribute('data-tab');
                document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
                document.getElementById(`${tabName}Form`).classList.add('active');
                
                // Clear messages
                clearMessages();
            });
        });

        // Clear all messages
        function clearMessages() {
            document.querySelectorAll('.message').forEach(msg => {
                msg.style.display = 'none';
                msg.textContent = '';
                msg.className = 'message';
            });
        }

        // Show message
        function showMessage(elementId, message, type) {
            const messageEl = document.getElementById(elementId);
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';
        }

        // Show loading
        function showLoading(elementId, show) {
            document.getElementById(elementId).style.display = show ? 'block' : 'none';
        }

        // Login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loginBtn = document.getElementById('loginBtn');
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            loginBtn.disabled = true;
            showLoading('loginLoading', true);
            clearMessages();
            
            try {
                const response = await fetch('http://localhost:7000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                console.log(response)
                console.log(result)

                if (response.ok) {
                    showMessage('loginMessage', 'Login successful!', 'success');
                    // Redirect to dashboard or home page
                    setTimeout(() => {
                       window.location.href = `/${result.dest}`;
                       console.log(result)
                    }, 1000);
                } else {
                    showMessage('loginMessage', 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('loginMessage', 'Network error. Please try again.', 'error');
            } finally {
                loginBtn.disabled = false;
                showLoading('loginLoading', false);
            }
        });

        // Signup form handler
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const signupBtn = document.getElementById('signupBtn');
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            signupBtn.disabled = true;
            showLoading('signupLoading', true);
            clearMessages();
            
            try {
                const response = await fetch('http://localhost:7000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                console.log(response)

                // const result = await response.json();


                
                if (response.ok) {
                    showMessage('signupMessage', 'Account created successfully!', 'success');
                    // Clear form
                    e.target.reset();
                    // Switch to login tab after successful signup
                    setTimeout(() => {
                        document.querySelector('[data-tab="login"]').click();
                    }, 2000);
                } else {
                    showMessage('signupMessage', 'Account creation failed', 'error');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showMessage('signupMessage', 'Network error. Please try again.', 'error');
            } finally {
                signupBtn.disabled = false;
                showLoading('signupLoading', false);
            }
        });