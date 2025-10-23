const idDispenserInput = document.getElementById('idDispenser');

// ¡IMPORTANTE! Reemplaza 'TU_APPS_SCRIPT_WEB_APP_URL' con la URL que obtuviste al desplegar Apps Script
const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzb4peNmPrZXegzTpiGzR1VE-i8glrHMwJBFrjYdUCwcA5iMqAd24SiGqzvLOAFb3XV/exec';

// Credenciales de acceso
const VALID_USERNAME = '1234';
const VALID_PASSWORD = '1234';

let loggedInUser = ''; // Variable para almacenar el usuario logeado

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const optionsScreen = document.getElementById('optionsScreen');
const bidonesScreen = document.getElementById('bidonesScreen');
const mantenimientoScreen = document.getElementById('mantenimientoScreen');

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const btnBidones = document.getElementById('btnBidones');
const btnMantenimiento = document.getElementById('btnMantenimiento');
const btnLogout = document.getElementById('btnLogout');

const bidonesForm = document.getElementById('bidonesForm');
const bidonesMessage = document.getElementById('bidonesMessage');
const backToOptionsFromBidones = document.getElementById('backToOptionsFromBidones');

const mantenimientoForm = document.getElementById('mantenimientoForm');
const mantenimientoMessage = document.getElementById('mantenimientoMessage');
const backToOptionsFromMantenimiento = document.getElementById('backToOptionsFromMantenimiento');

// Función para obtener el ID de la URL
function getDispenserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('idDispenser');
}

// Llama a la función al cargar la página para obtener el ID de la URL
const dispenserIdFromUrl = getDispenserIdFromUrl();
if (dispenserIdFromUrl) {
    localStorage.setItem('tempDispenserId', dispenserIdFromUrl);
}

// --- Funciones para mostrar pantallas ---
function showScreen(screenToShow) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    screenToShow.classList.add('active');
}

// --- Manejo del Login ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.toUpperCase();
    const password = passwordInput.value;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        loggedInUser = username;
        loginMessage.textContent = 'Inicio de sesión exitoso.';
        loginMessage.classList.remove('error-message');
        loginMessage.classList.add('success-message');
        
        // Lógica para usar el ID del QR después de iniciar sesión
        const tempDispenserId = localStorage.getItem('tempDispenserId');
        if (tempDispenserId) {
            idDispenserInput.value = tempDispenserId;
            showScreen(mantenimientoScreen);
            localStorage.removeItem('tempDispenserId');
        } else {
            showScreen(optionsScreen);
        }
    } else {
        loginMessage.textContent = 'Usuario o contraseña incorrectos.';
        loginMessage.classList.add('error-message');
        loginMessage.classList.remove('success-message');
    }
});

btnLogout.addEventListener('click', () => {
    loggedInUser = '';
    showScreen(loginScreen);
});

// --- Navegación entre opciones ---
btnBidones.addEventListener('click', () => {
    showScreen(bidonesScreen);
    bidonesMessage.textContent = '';
    bidonesForm.reset();
});

btnMantenimiento.addEventListener('click', () => {
    showScreen(mantenimientoScreen);
    mantenimientoMessage.textContent = '';
    mantenimientoForm.reset();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('fechaMantenimiento').value = `${yyyy}-${mm}-${dd}`;
});

backToOptionsFromBidones.addEventListener('click', () => {
    showScreen(optionsScreen);
});

backToOptionsFromMantenimiento.addEventListener('click', () => {
    showScreen(optionsScreen);
});

// --- Envío de datos de Bidones ---
bidonesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sheet', 'Entregas');
    formData.append('usuario', loggedInUser);
    formData.append('cantidadEntregados', document.getElementById('cantidadEntregados').value);
    formData.append('vaciosRetirados', document.getElementById('vaciosRetirados').value);
    formData.append('lugar', document.getElementById('lugar').value);
    formData.append('sector', document.getElementById('sector').value);
    formData.append('observaciones', document.getElementById('observacionesBidones').value);

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.text();
        bidonesMessage.textContent = '¡Datos de bidones guardados con éxito!';
        bidonesMessage.classList.remove('error-message');
        bidonesMessage.classList.add('success-message');
        bidonesForm.reset();
    } catch (error) {
        console.error('Error al enviar datos de bidones:', error);
        bidonesMessage.textContent = 'Error al guardar datos. Intenta de nuevo.';
        bidonesMessage.classList.remove('success-message');
        bidonesMessage.classList.add('error-message');
    }
});

// --- Envío de datos de Mantenimiento ---
mantenimientoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sheet', 'Mantenimiento');
    formData.append('usuario', loggedInUser);
    formData.append('idDispenser', idDispenserInput.value);
    formData.append('fechaMantenimiento', document.getElementById('fechaMantenimiento').value);
    formData.append('lugarDispenser', document.getElementById('lugarDispenser').value);
    formData.append('sectorDispenser', document.getElementById('sectorDispenser').value);
    formData.append('observacionesMantenimiento', document.getElementById('observacionesMantenimiento').value);

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.text();
        mantenimientoMessage.textContent = '¡Datos de mantenimiento guardados con éxito!';
        mantenimientoMessage.classList.remove('error-message');
        mantenimientoMessage.classList.add('success-message');
        mantenimientoForm.reset();
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById('fechaMantenimiento').value = `${yyyy}-${mm}-${dd}`;
    } catch (error) {
        console.error('Error al enviar datos de mantenimiento:', error);
        mantenimientoMessage.textContent = 'Error al guardar datos. Intenta de nuevo.';
        mantenimientoMessage.classList.remove('success-message');
        mantenimientoMessage.classList.add('error-message');
    }
});

// Inicializa mostrando la pantalla de login
showScreen(loginScreen);