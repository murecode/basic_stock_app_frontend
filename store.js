const USERS_KEY = 'basicstock_users';
const PRODUCTS_KEY_PREFIX = 'basicstock_products_';
const SESSION_KEY = 'basicstock_session';

// Datos iniciales para el primer usuario que se registre
const initialProducts = [
	{ id: 1, name: 'Camiseta Azul', sku: 'CAM-AZ-001', stock: 50 },
	{ id: 2, name: 'Pantalón Negro', sku: 'PAN-NG-002', stock: 25 },
	{ id: 3, name: 'Zapatillas Blancas', sku: 'ZAP-BL-003', stock: 10 },
	{ id: 4, name: 'Gorra Roja', sku: 'GOR-RJ-004', stock: 8 },
];

export function getUsers() {
	return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
	const users = getUsers();
	return users.find(user => user.email === email);
}

// NOTA: En una aplicación real, utiliza una biblioteca de hashing adecuada como bcrypt.
// Este es un "hash" simplificado solo para fines de demostración.
function simpleHash(password) {
	// Esto no es seguro, es solo para el ejemplo.
	return `hashed_${password}_salt`;
}

export function addUser(name, email, password) {
	const users = getUsers();
	if (findUserByEmail(email)) {
		return null; // El usuario ya existe
	}
	const newUser = {
		id: Date.now(),
		name,
		email,
		password: simpleHash(password)
	};
	users.push(newUser);
	saveUsers(users);

	// Si es el primer usuario, le asignamos productos de ejemplo.
	if (users.length === 1) {
		saveProductsForUser(newUser.id, initialProducts);
	} else {
		saveProductsForUser(newUser.id, []);
	}

	return newUser;
}

export function checkPassword(user, password) {
	return user.password === simpleHash(password);
}

// --- Gestión de Sesión ---
export function login(user) {
	sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function logout() {
	sessionStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
	try {
		return JSON.parse(sessionStorage.getItem(SESSION_KEY));
	} catch (e) {
		return null;
	}
}

// --- Gestión de Productos ---
export function getProductsForUser(userId) {
	const products = localStorage.getItem(`${PRODUCTS_KEY_PREFIX}${userId}`);
	return products ? JSON.parse(products) : [];
}

export function saveProductsForUser(userId, products) {
	localStorage.setItem(`${PRODUCTS_KEY_PREFIX}${userId}`, JSON.stringify(products));
}
