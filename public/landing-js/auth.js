document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('auth-form');
  const toggleBtn = document.getElementById('toggle-mode');
  const nameGroup = document.getElementById('name-group');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordHint = document.getElementById('password-hint');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitLoader = document.getElementById('submit-loader');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const toggleText = document.getElementById('toggle-text');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  let isSignupMode = false;

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  };

  const showSuccess = (message) => {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitText.style.display = loading ? 'none' : 'inline';
    submitLoader.style.display = loading ? 'inline-block' : 'none';
  };

  const toggleMode = () => {
    isSignupMode = !isSignupMode;

    if (isSignupMode) {
      authTitle.textContent = 'Create Account';
      authSubtitle.textContent = 'Sign up to get started';
      submitText.textContent = 'Sign Up';
      nameGroup.style.display = 'flex';
      passwordHint.style.display = 'block';
      nameInput.required = true;
      toggleText.innerHTML = 'Already have an account? <button type="button" id="toggle-mode" class="link-button">Login</button>';
    } else {
      authTitle.textContent = 'Welcome Back';
      authSubtitle.textContent = 'Login to your account';
      submitText.textContent = 'Login';
      nameGroup.style.display = 'none';
      passwordHint.style.display = 'none';
      nameInput.required = false;
      nameInput.value = '';
      toggleText.innerHTML = 'Don\'t have an account? <button type="button" id="toggle-mode" class="link-button">Sign up</button>';
    }

    document.getElementById('toggle-mode').addEventListener('click', toggleMode);
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
  };

  toggleBtn.addEventListener('click', toggleMode);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput.value.trim();

    if (isSignupMode && !name) {
      showError('Please enter your name.');
      return;
    }

    if (!email) {
      showError('Please enter your email.');
      return;
    }

    if (!password) {
      showError('Please enter your password.');
      return;
    }

    if (isSignupMode && password.length < 8) {
      showError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    try {
      const endpoint = isSignupMode ? '/auth/signup' : '/auth/login';
      const body = isSignupMode 
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(data.message);
        form.reset();
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        showError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });

  emailInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
  });

  passwordInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
  });

  nameInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
  });
});