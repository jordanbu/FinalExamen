class ParkingManager extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        // Template
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                @import "styles.css";
            </style>
            <div class="parking-manager">
                <div class="section">
                    <div class="section-title" id="titleA"></div>
                    <div class="grid" id="sectionA"></div>
                </div>
                <div class="section">
                    <div class="section-title" id="titleB"></div>
                    <div class="grid" id="sectionB"></div>
                </div>
            </div>
        `;

        shadow.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ['data-title-a', 'data-title-b'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-title-a') {
            this.shadowRoot.getElementById('titleA').textContent = newValue;
        } else if (name === 'data-title-b') {
            this.shadowRoot.getElementById('titleB').textContent = newValue;
        }
    }

    connectedCallback() {
        const sectionA = this.shadowRoot.getElementById('sectionA');
        const sectionB = this.shadowRoot.getElementById('sectionB');

        let parkingData = JSON.parse(localStorage.getItem('parkingData')) || {
            sectionA: [
                { spotId: 'A1', status: 'available' },
                { spotId: 'A2', status: 'available' },
                { spotId: 'A3', status: 'available' },
                { spotId: 'A4', status: 'available' }
            ],
            sectionB: [
                { spotId: 'B1', status: 'available' },
                { spotId: 'B2', status: 'available' },
                { spotId: 'B3', status: 'available' },
                { spotId: 'B4', status: 'available' }
            ]
        };

        const renderSection = (section, data) => {
            section.innerHTML = '';
            data.forEach((spot, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="spot-id">${spot.spotId}</div>
                    <input type="text" placeholder="Placa" id="plate-${spot.spotId}" style="display:none">
                    <input type="text" placeholder="Marca" id="brand-${spot.spotId}" style="display:none">
                    <input type="text" placeholder="Color" id="color-${spot.spotId}" style="display:none">
                    <input type="text" placeholder="Hora de Ingreso" id="entry-${spot.spotId}" style="display:none">
                    <input type="text" placeholder="Hora de Salida" id="exit-${spot.spotId}" style="display:none">
                    <div class="status ${spot.status}" data-section="${section.id}" data-index="${index}">
                        ${spot.status === 'available' ? 'Disponible' : 'Ocupado'}
                    </div>
                    <button data-section="${section.id}" data-index="${index}" style="display:none">Guardar</button>
                `;
                section.appendChild(card);
            });

            // Añadir eventos
            section.querySelectorAll('.status').forEach(statusElement => {
                statusElement.addEventListener('click', () => {
                    this.toggleStatus(statusElement.dataset.section, parseInt(statusElement.dataset.index, 10));
                });
            });

            section.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    this.saveData(button.dataset.section, parseInt(button.dataset.index, 10));
                });
            });
        };

        this.toggleStatus = (sectionId, index) => {
            let sectionData = parkingData[sectionId];
            const currentStatus = sectionData[index].status;
            const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
            sectionData[index].status = newStatus;
            localStorage.setItem('parkingData', JSON.stringify(parkingData));
            renderSection(this.shadowRoot.getElementById(sectionId), sectionData);

            const card = this.shadowRoot.querySelector(`#${sectionId} .card:nth-child(${index + 1})`);
            if (newStatus === 'occupied') {
                card.querySelectorAll('input').forEach(input => {
                    input.style.display = 'block';
                });
                card.querySelector('button').style.display = 'block';
            } else {
                card.querySelectorAll('input').forEach(input => {
                    input.style.display = 'none';
                });
                card.querySelector('button').style.display = 'none';
            }
        };

        this.saveData = (sectionId, index) => {
            const plateInput = this.shadowRoot.getElementById(`plate-${parkingData[sectionId][index].spotId}`);
            const brandInput = this.shadowRoot.getElementById(`brand-${parkingData[sectionId][index].spotId}`);
            const colorInput = this.shadowRoot.getElementById(`color-${parkingData[sectionId][index].spotId}`);
            const entryInput = this.shadowRoot.getElementById(`entry-${parkingData[sectionId][index].spotId}`);
            const exitInput = this.shadowRoot.getElementById(`exit-${parkingData[sectionId][index].spotId}`);

            const newData = {
                plate: plateInput.value,
                brand: brandInput.value,
                color: colorInput.value,
                entry: entryInput.value,
                exit: exitInput.value,
                status: 'occupied'
            };

            let storedData = JSON.parse(localStorage.getItem('storedData')) || [];
            storedData.push(newData);
            localStorage.setItem('storedData', JSON.stringify(storedData));

            plateInput.disabled = true;
            brandInput.disabled = true;
            colorInput.disabled = true;
            entryInput.disabled = true;
            exitInput.disabled = true;

            const saveButton = this.shadowRoot.querySelector(`#${sectionId} .card:nth-child(${index + 1}) button`);
            saveButton.textContent = 'Guardado';
            saveButton.disabled = true;

            alert('Los datos se han guardado correctamente.');
        };

        renderSection(sectionA, parkingData.sectionA);
        renderSection(sectionB, parkingData.sectionB);
    }
}

customElements.define('parking-manager', ParkingManager);

// Función para registrar usuarios
function registerUser(username, password, role) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ username, password, role });
    localStorage.setItem('users', JSON.stringify(users));
}

// Función para iniciar sesión
function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        return true;
    }
    return false;
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem('loggedInUser') !== null;
}

// Función para obtener el rol del usuario autenticado
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    return user ? user.role : null;
}

// Función para cerrar sesión
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    window.location.reload();
}

// Registrar usuarios iniciales (solo para pruebas, se debe eliminar o cambiar en producción)
if (!localStorage.getItem('users')) {
    registerUser('admin', 'admin123', 'admin');
    registerUser('operator', 'operator123', 'operator');
}

// Añadir eventos de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (loginUser(username, password)) {
        alert('Inicio de sesión exitoso');
        showContentBasedOnRole();
    } else {
        alert('Credenciales incorrectas');
    }
});

function showContentBasedOnRole() {
    const role = getUserRole();
    if (role === 'admin') {
        document.getElementById('adminContainer').style.display = 'block';
        document.getElementById('operatorContainer').style.display = 'none';
    } else if (role === 'operator') {
        document.getElementById('adminContainer').style.display = 'none';
        document.getElementById('operatorContainer').style.display = 'block';
    }
    document.getElementById('loginContainer').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    if (isAuthenticated()) {
        showContentBasedOnRole();
    } else {
        document.getElementById('loginContainer').style.display = 'block';
    }
});

// Función para generar informes
function generateReport() {
    let storedData = JSON.parse(localStorage.getItem('storedData')) || [];
    let reportOutput = document.getElementById('reportOutput');
    reportOutput.innerHTML = '';

    storedData.forEach((data, index) => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.innerHTML = `
            <h3>Transacción ${index + 1}</h3>
            <p>Placa: ${data.plate}</p>
            <p>Marca: ${data.brand}</p>
            <p>Color: ${data.color}</p>
            <p>Hora de Ingreso: ${data.entry}</p>
            <p>Hora de Salida: ${data.exit}</p>
        `;
        reportOutput.appendChild(reportItem);
    });
}
