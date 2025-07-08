// User Management System
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    registerUser(name, email, password) {
        if (this.users.find(user => user.email === email)) {
            throw new Error('Usuário já existe com este email');
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    loginUser(email, password) {
        const user = this.users.find(user => user.email === email);
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (!this.verifyPassword(password, user.password)) {
            throw new Error('Senha incorreta');
        }

        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    hashPassword(password) {
        return btoa(password + 'salt');
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Password Strength Checker
class PasswordStrengthChecker {
    static checkStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Senha deve ter pelo menos 8 caracteres');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Incluir letras minúsculas');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Incluir letras maiúsculas');
        }

        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Incluir números');
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Incluir caracteres especiais');
        }

        let strength = 'weak';
        let strengthText = 'Fraca';

        if (score >= 4) {
            strength = 'strong';
            strengthText = 'Forte';
        } else if (score >= 3) {
            strength = 'good';
            strengthText = 'Boa';
        } else if (score >= 2) {
            strength = 'fair';
            strengthText = 'Média';
        }

        return {
            score: score,
            strength: strength,
            strengthText: strengthText,
            feedback: feedback
        };
    }
}

// Notification System
class NotificationSystem {
    static show(message, type = 'success', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-text">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        container.appendChild(notification);

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
}

// Form Validation
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 8;
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }
}

// Initialize the application
const userManager = new UserManager();

// DOM Elements
const loginForm = document.getElementById('loginFormElement');
const registrationForm = document.getElementById('registrationFormElement');
const loginSection = document.getElementById('loginForm');
const registrationSection = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    if (userManager.isLoggedIn()) {
        showSuccessMessage(`Bem-vindo de volta, ${userManager.getCurrentUser().name}!`);
    }

    loginForm.addEventListener('submit', handleLogin);
    registrationForm.addEventListener('submit', handleRegistration);

    const regPassword = document.getElementById('regPassword');
    regPassword.addEventListener('input', updatePasswordStrength);

    const regConfirmPassword = document.getElementById('regConfirmPassword');
    regConfirmPassword.addEventListener('input', validatePasswordConfirmation);
});

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!FormValidator.validateEmail(email)) {
        NotificationSystem.show('Por favor, insira um email válido', 'error');
        return;
    }

    if (!FormValidator.validatePassword(password)) {
        NotificationSystem.show('Por favor, insira uma senha válida', 'error');
        return;
    }

    try {
        const user = userManager.loginUser(email, password);
        NotificationSystem.show('Login realizado com sucesso!', 'success');
        showSuccessMessage(`Bem-vindo, ${user.name}!`);
        loginForm.reset();
    } catch (error) {
        NotificationSystem.show(error.message, 'error');
    }
}

// Handle registration form submission
function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!FormValidator.validateName(name)) {
        NotificationSystem.show('Nome deve ter pelo menos 2 caracteres', 'error');
        return;
    }

    if (!FormValidator.validateEmail(email)) {
        NotificationSystem.show('Por favor, insira um email válido', 'error');
        return;
    }

    if (!FormValidator.validatePassword(password)) {
        NotificationSystem.show('Senha deve ter pelo menos 8 caracteres', 'error');
        return;
    }

    if (password !== confirmPassword) {
        NotificationSystem.show('Senhas não coincidem', 'error');
        return;
    }

    const strength = PasswordStrengthChecker.checkStrength(password);
    if (strength.score < 3) {
        NotificationSystem.show('Senha muito fraca. Tente uma senha mais forte.', 'warning');
        return;
    }

    try {
        const user = userManager.registerUser(name, email, password);
        NotificationSystem.show('Conta criada com sucesso!', 'success');
        showSuccessMessage(`Conta criada para ${user.name}! Você pode fazer login agora.`);
        registrationForm.reset();
        resetPasswordStrength();
    } catch (error) {
        NotificationSystem.show(error.message, 'error');
    }
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (password.length === 0) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Força da senha';
        return;
    }

    const strength = PasswordStrengthChecker.checkStrength(password);
    strengthFill.className = `strength-fill ${strength.strength}`;
    strengthText.textContent = strength.strengthText;
}

// Reset password strength indicator
function resetPasswordStrength() {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    strengthFill.className = 'strength-fill';
    strengthText.textContent = 'Força da senha';
}

// Validate password confirmation
function validatePasswordConfirmation() {
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        document.getElementById('regConfirmPassword').style.borderColor = '#dc3545';
    } else {
        document.getElementById('regConfirmPassword').style.borderColor = '#e1e5e9';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Show registration form
function showRegistrationForm() {
    loginSection.classList.add('hidden');
    registrationSection.classList.remove('hidden');
}

// Show login form
function showLoginForm() {
    registrationSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// Show success message
function showSuccessMessage(message) {
    successText.textContent = message;
    loginSection.classList.add('hidden');
    registrationSection.classList.add('hidden');
    successMessage.classList.remove('hidden');
}

// Hide success message
function hideSuccessMessage() {
    successMessage.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// Logout function
function logout() {
    userManager.logoutUser();
    NotificationSystem.show('Logout realizado com sucesso', 'success');
    hideSuccessMessage();
} 