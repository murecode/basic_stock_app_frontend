import * as store from './store.js';
import { initApp } from './app.js';

// DOM Elements
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerError = document.getElementById('register-error');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

function showAuthView() {
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
    loginForm.reset();
    registerForm.reset();
}

function showAppView() {
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
}

function handleLogin(event) {
    event.preventDefault();
    loginError.classList.add('hidden');
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    const user = store.findUserByEmail(email);

    if (user && store.checkPassword(user, password)) {
        store.login(user);
        initApp();
        showAppView();
    } else {
        loginError.textContent = 'Email o contraseña incorrectos.';
        loginError.classList.remove('hidden');
    }
}

function handleRegister(event) {
    event.preventDefault();
    registerError.classList.add('hidden');
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    
    if (!name || !email || !password) {
        registerError.textContent = 'Todos los campos son obligatorios.';
        registerError.classList.remove('hidden');
        return;
    }

    if (store.findUserByEmail(email)) {
        registerError.textContent = 'Este email ya está registrado.';
        registerError.classList.remove('hidden');
        return;
    }

    const newUser = store.addUser(name, email, password);
    if (newUser) {
        store.login(newUser);
        initApp();
        showAppView();
    } else {
        registerError.textContent = 'Error al crear la cuenta. Inténtalo de nuevo.';
        registerError.classList.remove('hidden');
    }
}

function switchToRegisterView(event) {
    event.preventDefault();
    loginError.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function switchToLoginView(event) {
    event.preventDefault();
    registerError.classList.add('hidden');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
}

export function initAuth() {
    showAuthView();
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    showRegisterLink.addEventListener('click', switchToRegisterView);
    showLoginLink.addEventListener('click', switchToLoginView);
}
