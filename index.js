import { getCurrentUser } from './store.js';
import { initAuth } from './auth.js';
import { initApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('app-view').classList.remove('hidden');
        document.getElementById('auth-view').classList.add('hidden');
        initApp();
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
        initAuth();
    }
});
