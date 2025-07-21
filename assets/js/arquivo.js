// JWT Authentication System with Vue.js
const { createApp } = Vue;

// JWT Utility Functions
const JWTUtils = {
    // Decode JWT token without verification (for client-side display)
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return null;
        }
    },

    // Check if token is expired
    isTokenExpired(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        return Date.now() >= decoded.exp * 1000;
    },

    // Store token in localStorage
    storeToken(token) {
        localStorage.setItem('jwt_token', token);
    },

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('jwt_token');
    },

    // Remove token from localStorage
    removeToken() {
        localStorage.removeItem('jwt_token');
    }
};

// API Service
const APIService = {
    baseURL: 'http://localhost:3000/api',

    async request(endpoint, options = {}) {
        const token = JWTUtils.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Login API call
    async login(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Register API call
    async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Get user profile
    async getProfile() {
        return this.request('/profile');
    },

    // Logout API call
    async logout() {
        return this.request('/logout', {
            method: 'POST'
        });
    }
};

// Notification System
const NotificationSystem = {
    show(message, type = 'success', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-text">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
};

// Password Strength Checker
const PasswordStrength = {
    check(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        // Lowercase check
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Include lowercase letters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Include uppercase letters');

        // Numbers check
        if (/\d/.test(password)) score += 1;
        else feedback.push('Include numbers');

        // Special characters check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('Include special characters');

        let strength = 'weak';
        let icon = 'fas fa-times-circle';
        let color = 'weak';

        if (score >= 5) {
            strength = 'strong';
            icon = 'fas fa-check-circle';
            color = 'strong';
        } else if (score >= 4) {
            strength = 'good';
            icon = 'fas fa-check';
            color = 'good';
        } else if (score >= 3) {
            strength = 'fair';
            icon = 'fas fa-exclamation-triangle';
            color = 'fair';
        }

        return {
            score,
            strength,
            feedback,
            class: color,
            icon,
            text: strength.charAt(0).toUpperCase() + strength.slice(1)
        };
    }
};

// Vue.js Application
const app = createApp({
    data() {
        return {
            loading: true,
            isAuthenticated: false,
            showRegister: false,
            user: null,
            
            // Login form
            loginForm: {
                email: '',
                password: ''
            },
            loginErrors: {},
            loginLoading: false,
            showLoginPassword: false,
            
            // Register form
            registerForm: {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
            registerErrors: {},
            registerLoading: false,
            showRegisterPassword: false,
            showConfirmPassword: false,
            
            // Password strength
            passwordStrength: {
                class: '',
                icon: '',
                text: ''
            }
        };
    },

    async mounted() {
        await this.checkAuthentication();
        this.loading = false;
    },

    methods: {
        // Check if user is already authenticated
        async checkAuthentication() {
            const token = JWTUtils.getToken();
            if (token && !JWTUtils.isTokenExpired(token)) {
                const decoded = JWTUtils.decodeToken(token);
                if (decoded) {
                    this.user = {
                        name: decoded.name || 'User',
                        email: decoded.email || 'user@example.com',
                        loginTime: new Date().toISOString()
                    };
                    this.isAuthenticated = true;
                }
            } else if (token) {
                // Token is expired, remove it
                JWTUtils.removeToken();
            }
        },

        // Handle login form submission
        async handleLogin() {
            this.clearLoginErrors();
            if (!this.loginForm.email) {
                this.loginErrors.email = 'Email is required';
                return;
            }
            if (!this.loginForm.password) {
                this.loginErrors.password = 'Password is required';
                return;
            }
            this.loginLoading = true;
            try {
                const response = await APIService.login(this.loginForm);
                if (response.success) {
                    JWTUtils.storeToken(response.token);
                    // Set user from JWT payload
                    const decoded = JWTUtils.decodeToken(response.token);
                    this.user = {
                        name: decoded.name || response.user.name || 'User',
                        email: decoded.email || response.user.email || 'user@example.com',
                        loginTime: response.user.loginTime || new Date().toISOString()
                    };
                    this.isAuthenticated = true;
                    this.clearForms();
                    NotificationSystem.show('Login successful! Welcome back.', 'success');
                }
            } catch (error) {
                NotificationSystem.show(error.message || 'Login failed. Please try again.', 'error');
            } finally {
                this.loginLoading = false;
            }
        },

        // Handle register form submission
        async handleRegister() {
            this.clearRegisterErrors();
            if (!this.registerForm.name.trim()) {
                this.registerErrors.name = 'Name is required';
                return;
            }
            if (!this.registerForm.email) {
                this.registerErrors.email = 'Email is required';
                return;
            }
            if (!this.isValidEmail(this.registerForm.email)) {
                this.registerErrors.email = 'Please enter a valid email address';
                return;
            }
            if (!this.registerForm.password) {
                this.registerErrors.password = 'Password is required';
                return;
            }
            if (this.registerForm.password.length < 8) {
                this.registerErrors.password = 'Password must be at least 8 characters long';
                return;
            }
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.registerErrors.confirmPassword = 'Passwords do not match';
                return;
            }
            this.registerLoading = true;
            try {
                const response = await APIService.register(this.registerForm);
                if (response.success) {
                    JWTUtils.storeToken(response.token);
                    // Set user from JWT payload
                    const decoded = JWTUtils.decodeToken(response.token);
                    this.user = {
                        name: decoded.name || response.user.name || 'User',
                        email: decoded.email || response.user.email || 'user@example.com',
                        loginTime: new Date().toISOString()
                    };
                    this.isAuthenticated = true;
                    this.clearForms();
                    NotificationSystem.show('Registration successful! Welcome to our platform.', 'success');
                }
            } catch (error) {
                NotificationSystem.show(error.message || 'Registration failed. Please try again.', 'error');
            } finally {
                this.registerLoading = false;
            }
        },

        // Logout user
        logout() {
            JWTUtils.removeToken();
            this.isAuthenticated = false;
            this.user = null;
            this.showRegister = false;
            this.clearForms();
            NotificationSystem.show('You have been logged out successfully.', 'success');
        },

        // Check password strength
        checkPasswordStrength() {
            if (this.registerForm.password) {
                this.passwordStrength = PasswordStrength.check(this.registerForm.password);
            } else {
                this.passwordStrength = { class: '', icon: '', text: '' };
            }
        },

        // Clear login form errors
        clearLoginErrors() {
            this.loginErrors = {};
        },

        // Clear register form errors
        clearRegisterErrors() {
            this.registerErrors = {};
        },

        // Clear all forms
        clearForms() {
            this.loginForm = { email: '', password: '' };
            this.registerForm = { name: '', email: '', password: '', confirmPassword: '' };
            this.loginErrors = {};
            this.registerErrors = {};
            this.passwordStrength = { class: '', icon: '', text: '' };
            this.showLoginPassword = false;
            this.showRegisterPassword = false;
            this.showConfirmPassword = false;
        },

        // Validate email format
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Format date for display
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
});

// Mount the Vue application
app.mount('#app');

// Global notification function for external use
window.showNotification = NotificationSystem.show;
