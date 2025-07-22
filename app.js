import * as store from './store.js';
import { initAuth } from './auth.js';

// --- STATE ---
let products = [];
let currentUser = null;
let modalMode = null; // 'add', 'edit', 'stock-in', 'stock-out'
let selectedProductId = null;

// --- CONSTANTS ---
const LOW_STOCK_THRESHOLD = 10;

// --- DOM ELEMENTS ---
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const welcomeMessage = document.getElementById('welcome-message');
const logoutBtn = document.getElementById('logout-btn');
const tableBody = document.getElementById('product-table-body');
const addProductBtn = document.getElementById('add-product-btn');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productSkuInput = document.getElementById('product-sku');
const productStockInput = document.getElementById('product-stock');
const initialStockField = document.getElementById('initial-stock-field');
const productFormCancelBtn = document.getElementById('modal-cancel-btn-product');
const stockForm = document.getElementById('stock-form');
const currentStockSpan = document.getElementById('current-stock');
const stockAmountInput = document.getElementById('stock-amount');
const stockFormCancelBtn = document.getElementById('modal-cancel-btn-stock');

// --- ICONS (inlined SVG strings) ---
const ICONS = {
    edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`,
    stockIn: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    stockOut: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`,
};

function saveAndRender() {
    store.saveProductsForUser(currentUser.id, products);
    renderProductTable();
}

const renderProductTable = () => {
    tableBody.innerHTML = '';
    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center px-6 py-10 text-slate-500">No hay productos en tu inventario. ¡Añade uno!</td></tr>`;
        return;
    }

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.className = 'bg-white border-b hover:bg-slate-50';
        const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;
        const stockClass = isLowStock ? 'text-red-600 font-bold' : '';
        const lowStockBadge = isLowStock ? `<span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full ml-2">Bajo!</span>` : '';

        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900">${product.id}</td>
            <td class="px-6 py-4 font-medium text-slate-900">${product.name}</td>
            <td class="px-6 py-4">${product.sku}</td>
            <td class="px-6 py-4"><div class="flex items-center ${stockClass}">${product.stock}${lowStockBadge}</div></td>
            <td class="px-6 py-4">
                <div class="flex justify-center items-center gap-2">
                    <button data-action="edit" data-id="${product.id}" class="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition-colors" title="Editar">${ICONS.edit}</button>
                    <button data-action="stock-in" data-id="${product.id}" class="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Entrada de Stock">${ICONS.stockIn}</button>
                    <button data-action="stock-out" data-id="${product.id}" class="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-colors" title="Salida de Stock">${ICONS.stockOut}</button>
                    <button data-action="delete" data-id="${product.id}" class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Eliminar">${ICONS.delete}</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
};

const openModal = (mode, productId = null) => {
    modalMode = mode;
    selectedProductId = productId;
    const product = products.find(p => p.id === selectedProductId);

    productForm.classList.add('hidden');
    stockForm.classList.add('hidden');

    if (mode === 'add') {
        modalTitle.textContent = 'Añadir Nuevo Producto';
        productForm.reset();
        productIdInput.value = '';
        initialStockField.classList.remove('hidden');
        productForm.classList.remove('hidden');
        productNameInput.focus();
    } else if (mode === 'edit' && product) {
        modalTitle.textContent = `Editar Producto: ${product.name}`;
        productIdInput.value = product.id;
        productNameInput.value = product.name;
        productSkuInput.value = product.sku;
        initialStockField.classList.add('hidden');
        productForm.classList.remove('hidden');
        productNameInput.focus();
    } else if ((mode === 'stock-in' || mode === 'stock-out') && product) {
        modalTitle.textContent = `${mode === 'stock-in' ? 'Entrada' : 'Salida'} de Stock: ${product.name}`;
        currentStockSpan.textContent = product.stock;
        stockForm.reset();
        stockForm.classList.remove('hidden');
        stockAmountInput.focus();
    }
    modal.classList.remove('hidden');
};

const closeModal = () => {
    modal.classList.add('hidden');
    modalMode = null;
    selectedProductId = null;
};

const handleProductFormSubmit = (e) => {
    e.preventDefault();
    const name = productNameInput.value.trim();
    const sku = productSkuInput.value.trim();
    if (!name || !sku) return;

    if (modalMode === 'add') {
        const stock = parseInt(productStockInput.value, 10) || 0;
        const newProduct = {
            id: Math.max(0, ...products.map(p => p.id)) + 1,
            name, sku, stock
        };
        products.push(newProduct);
    } else if (modalMode === 'edit') {
        products = products.map(p => p.id === selectedProductId ? { ...p, name, sku } : p);
    }

    saveAndRender();
    closeModal();
};

const handleStockFormSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(stockAmountInput.value, 10);
    if (isNaN(amount) || amount <= 0) return;

    products = products.map(p => {
        if (p.id === selectedProductId) {
            const newStock = modalMode === 'stock-in' ? p.stock + amount : p.stock - amount;
            return { ...p, stock: Math.max(0, newStock) };
        }
        return p;
    });

    saveAndRender();
    closeModal();
};

const handleTableClick = (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const id = parseInt(button.dataset.id, 10);
    const product = products.find(p => p.id === id);

    if (action === 'delete' && product) {
        if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
            products = products.filter(p => p.id !== id);
            saveAndRender();
        }
    } else {
        openModal(action, id);
    }
};

function handleLogout() {
    store.logout();
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
    // Re-initialize auth listeners in case the user wants to log back in
    initAuth();
}

export function initApp() {
    currentUser = store.getCurrentUser();
    if (!currentUser) {
        handleLogout();
        return;
    }

    products = store.getProductsForUser(currentUser.id);
    welcomeMessage.textContent = `Bienvenido/a de nuevo, ${currentUser.name}.`;
    
    renderProductTable();
    
    // Set up event listeners only once
    if (!appView.dataset.initialized) {
        addProductBtn.addEventListener('click', () => openModal('add'));
        tableBody.addEventListener('click', handleTableClick);
        productForm.addEventListener('submit', handleProductFormSubmit);
        stockForm.addEventListener('submit', handleStockFormSubmit);
        modalCloseBtn.addEventListener('click', closeModal);
        productFormCancelBtn.addEventListener('click', closeModal);
        stockFormCancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        logoutBtn.addEventListener('click', handleLogout);
        appView.dataset.initialized = true;
    }
}
