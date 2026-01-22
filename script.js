const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw96gRN7MZxMuYs3rjJ2SP9LwWu7ZBTKwnapNN-QE6pI88L0ApvB7JjckQ0TdhyW-8l/exec';
const VALID_USERNAME = '1234';
const VALID_PASSWORD = '1234';

let loggedInUser = '';

// Elementos del DOM
const screens = {
    login: document.getElementById('loginScreen'),
    options: document.getElementById('optionsScreen'),
    bidones: document.getElementById('bidonesScreen'),
    mantenimiento: document.getElementById('mantenimientoScreen'),
    historial: document.getElementById('historialScreen')
};

const countHistorial = document.getElementById('countHistorial');
const listaHistorial = document.getElementById('listaHistorial');

// --- LÓGICA DE HISTORIAL Y RESET DIARIO ---

function checkDailyReset() {
    const lastDate = localStorage.getItem('lastDate');
    const today = new Date().toLocaleDateString();

    if (lastDate !== today) {
        localStorage.setItem('historial', JSON.stringify([]));
        localStorage.setItem('lastDate', today);
    }
    updateHistoryCounter();
}

function saveToLocalHistory(type, detail) {
    const historial = JSON.parse(localStorage.getItem('historial') || '[]');
    const item = {
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type,
        detail: detail
    };
    historial.unshift(item); // Agregar al principio
    localStorage.setItem('historial', JSON.stringify(historial));
    updateHistoryCounter();
}

function updateHistoryCounter() {
    const historial = JSON.parse(localStorage.getItem('historial') || '[]');
    countHistorial.textContent = historial.length;
}

function renderHistorial() {
    const historial = JSON.parse(localStorage.getItem('historial') || '[]');
    listaHistorial.innerHTML = historial.length === 0 ? '<p>No hay registros hoy.</p>' : '';
    
    historial.forEach(item => {
        const div = document.createElement('div');
        div.className = 'historial-item';
        div.innerHTML = `
            <span class="historial-tag">[${item.hora}] ${item.type}</span>
            <span>${item.detail}</span>
        `;
        listaHistorial.appendChild(div);
    });
}

// --- NAVEGACIÓN ---

function showScreen(screenToShow) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screenToShow.classList.add('active');
}

// --- EVENTOS ---

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.toUpperCase();
    const pass = document.getElementById('password').value;

    if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
        loggedInUser = user;
        checkDailyReset();
        const tempId = localStorage.getItem('tempDispenserId');
        if (tempId) {
            document.getElementById('idDispenser').value = tempId;
            localStorage.removeItem('tempDispenserId');
            showScreen(screens.mantenimiento);
        } else {
            showScreen(screens.options);
        }
    } else {
        document.getElementById('loginMessage').textContent = 'Error de credenciales';
    }
});

// Botones de navegación
document.getElementById('btnBidones').onclick = () => showScreen(screens.bidones);
document.getElementById('btnMantenimiento').onclick = () => showScreen(screens.mantenimiento);
document.getElementById('btnHistorial').onclick = () => { renderHistorial(); showScreen(screens.historial); };
document.getElementById('btnLogout').onclick = () => location.reload();
document.getElementById('backToOptionsFromBidones').onclick = () => showScreen(screens.options);
document.getElementById('backToOptionsFromMantenimiento').onclick = () => showScreen(screens.options);
document.getElementById('backToOptionsFromHistorial').onclick = () => showScreen(screens.options);

// --- ENVÍO DE DATOS (ALTA VELOCIDAD) ---

async function sendDataInBackground(formData, successMsgElement) {
    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, { method: 'POST', body: formData });
        console.log('Enviado con éxito');
    } catch (error) {
        console.error('Error en segundo plano:', error);
    }
}

// Submit Bidones
document.getElementById('bidonesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Capturar datos
    const lug = document.getElementById('lugar').value;
    const cant = document.getElementById('cantidadEntregados').value;
    const detail = `${lug} - Entregados: ${cant}`;
    
    // 2. Guardar en historial local inmediatamente
    saveToLocalHistory('Bidones', detail);

    // 3. Preparar FormData
    const formData = new FormData(this);
    formData.append('sheet', 'Entregas');
    formData.append('usuario', loggedInUser);
    formData.append('lugar', lug);
    formData.append('sector', document.getElementById('sector').value);
    formData.append('cantidadEntregados', cant);
    formData.append('vaciosRetirados', document.getElementById('vaciosRetirados').value);
    formData.append('observaciones', document.getElementById('observacionesBidones').value);

    // 4. Enviar en segundo plano (no usamos await aquí para no bloquear)
    sendDataInBackground(formData);

    // 5. Limpiar UI instantáneamente para el siguiente
    this.reset();
    document.getElementById('bidonesMessage').textContent = 'Guardado localmente y enviando...';
    setTimeout(() => document.getElementById('bidonesMessage').textContent = '', 2000);
});

// Submit Mantenimiento
document.getElementById('mantenimientoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const idDisp = document.getElementById('idDispenser').value || 'S/N';
    const lug = document.getElementById('lugarDispenser').value;
    const detail = `ID: ${idDisp} en ${lug}`;

    saveToLocalHistory('Mantenimiento', detail);

    const formData = new FormData(this);
    formData.append('sheet', 'Mantenimiento');
    formData.append('usuario', loggedInUser);
    formData.append('idDispenser', idDisp);
    formData.append('fechaMantenimiento', new Date().toISOString().split('T')[0]);
    formData.append('lugarDispenser', lug);
    formData.append('sectorDispenser', document.getElementById('sectorDispenser').value);
    formData.append('observacionesMantenimiento', document.getElementById('observacionesMantenimiento').value);

    sendDataInBackground(formData);

    this.reset();
    document.getElementById('mantenimientoMessage').textContent = 'Guardado localmente y enviando...';
    setTimeout(() => document.getElementById('mantenimientoMessage').textContent = '', 2000);
});

// Capturar ID de URL
const urlParams = new URLSearchParams(window.location.search);
const idUrl = urlParams.get('idDispenser');
if (idUrl) localStorage.setItem('tempDispenserId', idUrl);

// Inicializar
checkDailyReset();