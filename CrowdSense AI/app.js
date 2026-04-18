// app.js - Premium CrowdSense AI Demo Edition
// ----------------------------------------------------
// Intro Sequence & Onboarding
// ----------------------------------------------------
const introScreen = document.getElementById('intro-screen');
const appWrapper = document.getElementById('app-wrapper');
const enterBtn = document.getElementById('enter-dashboard-btn');
const introInput = document.getElementById('intro-name-input');
const displayName = document.getElementById('display-name');

enterBtn.addEventListener('click', initializeDashboard);
introInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') initializeDashboard(); });

function initializeDashboard() {
    const name = introInput.value.trim() || 'Executive Viewer';
    
    // Add loading state to button
    enterBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Establishing Uplink...';
    enterBtn.style.opacity = '0.8';
    
    setTimeout(() => {
        // Transition screens
        introScreen.classList.add('fade-out');
        appWrapper.classList.remove('hidden');
        
        // Set user name
        displayName.innerText = name;
        
        // Add personalized welcome alert
        STADIUM_DATA.alerts.unshift({
            id: Date.now(),
            title: `Welcome, ${name}!`,
            desc: `Your routing system is active and optimized for VIP pathways.`,
            urgent: false
        });
        unreadCount++;
        renderUI();
        
        // Subtle bell animation
        setTimeout(() => document.getElementById('notif-bell').classList.add('3d-hover'), 1000);
        
        // Remove intro DOM entirely after fade to save memory
        setTimeout(() => introScreen.remove(), 1000);
    }, 1200);
}

// ----------------------------------------------------
// 3D Tilt Logic for Cards (Vanilla JS, highly performant)
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.3d-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPct = (x / rect.width - 0.5) * 2; // -1 to 1
            const yPct = (y / rect.height - 0.5) * 2; // -1 to 1
            
            // Soft rotation: max 3 degrees
            card.style.transform = `perspective(1000px) rotateX(${-yPct * 3}deg) rotateY(${xPct * 3}deg) scale3d(1.01, 1.01, 1.01)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
});

// ----------------------------------------------------
// Core Logic (Preserved)
// ----------------------------------------------------
let map;
let polygons = [];
let userMarker = null;
let currentTargetGate = null;
let is3D = false;
let userLocCoords = null;
let unreadCount = 3; 

const STADIUM_DATA = {
    gates: [
        { id: 'gate-1', name: 'Gate 1 (Main)', coords: [{lat:23.0925, lng:72.5960}, {lat:23.0925, lng:72.5965}, {lat:23.0920, lng:72.5965}, {lat:23.0920, lng:72.5960}], status: 'safe', load: 25, crowded: false },
        { id: 'gate-2', name: 'Gate 2 (North)', coords: [{lat:23.0935, lng:72.5975}, {lat:23.0935, lng:72.5980}, {lat:23.0930, lng:72.5980}, {lat:23.0930, lng:72.5975}], status: 'critical', load: 95, crowded: true },
        { id: 'gate-vip', name: 'VIP Pavilion Gate', coords: [{lat:23.0910, lng:72.5985}, {lat:23.0910, lng:72.5990}, {lat:23.0905, lng:72.5990}, {lat:23.0905, lng:72.5985}], status: 'warning', load: 60, crowded: false }
    ],
    stalls: [
        { id: 'food-a', name: 'Food Court A', lat: 23.0915, lng: 72.5960, icon: 'fa-burger', status: 'busy', type: 'food' },
        { id: 'food-b', name: 'Snacks Kiosk B', lat: 23.0928, lng: 72.5980, icon: 'fa-pizza-slice', status: 'free', type: 'food' },
        { id: 'merch-1', name: 'Official Merch', lat: 23.0920, lng: 72.5990, icon: 'fa-shirt', status: 'busy', type: 'merch' },
        { id: 'medical', name: 'Medical Tent', lat: 23.0910, lng: 72.5970, icon: 'fa-kit-medical', status: 'free', type: 'health' }
    ],
    alerts: [
        { id: 1, title: 'Heavy Traffic at Gate 2', desc: 'Please use Gate 1 for faster entry.', urgent: true },
        { id: 2, title: 'Match Starting Soon', desc: 'Taking your seats is advised.', urgent: false },
        { id: 3, title: 'Food Court A is busy', desc: 'Current wait time: 15 mins.', urgent: false }
    ]
};

const COLORS = { safe: '#10b981', warning: '#f59e0b', critical: '#ef4444' };

window.initMap = function() {
    const stadiumBounds = { north: 23.0980, south: 23.0850, west: 72.5900, east: 72.6050 };

    map = new google.maps.Map(document.getElementById('google-map'), {
        center: { lat: 23.0916, lng: 72.5975 },
        zoom: 17,
        minZoom: 16,
        maxZoom: 20,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        tilt: 0,
        heading: 0,
        restriction: { latLngBounds: stadiumBounds, strictBounds: true }
    });

    renderMapPolygons();
    renderUI();
};

function renderMapPolygons() {
    polygons.forEach(p => p.setMap(null));
    polygons = [];
    STADIUM_DATA.gates.forEach(gate => {
        polygons.push(new google.maps.Polygon({
            paths: gate.coords, strokeColor: COLORS[gate.status], strokeWeight: 2, fillColor: COLORS[gate.status], fillOpacity: 0.6, map: map
        }));
    });
}

function renderUI() {
    const gateList = document.getElementById('gate-list');
    gateList.innerHTML = STADIUM_DATA.gates.map(gate => {
        const waitTime = Math.ceil(gate.load / 5) + " mins";
        const isRouted = currentTargetGate === gate.id ? 'routed' : '';
        const routedHtml = isRouted ? `<span style="color:#60a5fa; font-size:0.75rem;"><i class="fa-solid fa-location-arrow"></i> Your Auto-Route</span>` : '';
        return `<div class="gate-item ${gate.status} ${isRouted}">
            <div class="gate-info"><h4>${gate.name}</h4><p><i class="fa-solid ${gate.crowded ? 'fa-people-group' : 'fa-person-walking'}"></i> Load: ${gate.load}% ${routedHtml}</p></div>
            <div class="gate-eta"><div class="time">${waitTime}</div><div class="label">Wait Time</div></div>
            <div class="load-bar" style="width: ${gate.load}%;"></div>
        </div>`;
    }).join('');

    const stallGrid = document.getElementById('stall-grid');
    stallGrid.innerHTML = STADIUM_DATA.stalls.map(stall => `
        <div class="stall-card">
            <div class="stall-name"><i class="fa-solid ${stall.icon}"></i> ${stall.name}</div>
            <div class="stall-status ${stall.status}">${stall.status === 'free' ? 'Order Now (Free)' : 'Busy (15m Wait)'}</div>
        </div>
    `).join('');

    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = STADIUM_DATA.alerts.map(alert => `
        <li class="alert-item ${alert.urgent ? 'urgent' : ''}">
            <div class="alert-icon"><i class="fa-solid ${alert.urgent ? 'fa-triangle-exclamation' : 'fa-bell'}"></i></div>
            <div class="alert-text"><h4>${alert.title}</h4><p>${alert.desc}</p></div>
        </li>
    `).join('');

    const badge = document.getElementById('notif-badge');
    if (unreadCount > 0) { badge.style.display = 'flex'; badge.innerText = unreadCount; }
    else { badge.style.display = 'none'; }
}

const notifBell = document.getElementById('notif-bell');
const notifDropdown = document.getElementById('notif-dropdown');
notifBell.addEventListener('click', (e) => {
    notifDropdown.classList.toggle('active');
    if (notifDropdown.classList.contains('active')) { unreadCount = 0; renderUI(); }
    e.stopPropagation();
});
notifDropdown.addEventListener('click', (e) => e.stopPropagation());
document.addEventListener('click', () => notifDropdown.classList.remove('active'));

// ----------------------------------------------------
// Theme Toggle Logic
// ----------------------------------------------------
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// ----------------------------------------------------
// Toggle 3D Map
// ----------------------------------------------------
document.getElementById('toggle-3d-btn').addEventListener('click', () => {
    is3D = !is3D;
    if (is3D) {
        map.setZoom(18); map.setTilt(45); map.setHeading(90);
        document.getElementById('toggle-3d-btn').innerHTML = `<i class="fa-solid fa-cube"></i> 2D View`;
    } else {
        map.setTilt(0); map.setHeading(0); map.setZoom(17);
        document.getElementById('toggle-3d-btn').innerHTML = `<i class="fa-solid fa-cube"></i> Toggle 3D`;
    }
});

document.getElementById('locate-me-btn').addEventListener('click', () => {
    userLocCoords = { lat: 23.0900, lng: 72.5975 };
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({
        position: userLocCoords, map: map, title: "Your Location",
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }
    });
    map.panTo(userLocCoords); map.setZoom(18);
    autoRouteUser();
});

function autoRouteUser() {
    addChatMessage('ai', `Locating your signal... You are near the South Entrance.`);
    setTimeout(() => {
        const safeGates = STADIUM_DATA.gates.filter(g => !g.crowded);
        if (safeGates.length > 0) {
            safeGates.sort((a, b) => a.load - b.load);
            const bestGate = safeGates[0];
            bestGate.load += 5; 
            currentTargetGate = bestGate.id;
            addChatMessage('ai', `<b>Load Balancing Active:</b> Gate 2 is severely congested (95% load). Distributing traffic... You are reassigned to <b>${bestGate.name}</b>. Wait time is approx ${Math.ceil(bestGate.load/5)} mins. Path updated.`);
            map.panTo({lat: bestGate.coords[0].lat, lng: bestGate.coords[0].lng});
            renderUI();
        }
    }, 1500);
}

const searchInput = document.getElementById('ai-search-input');
const searchBtn = document.getElementById('ai-search-btn');
const chatHistory = document.getElementById('chat-history');
let chatContext = [];

searchBtn.addEventListener('click', processAIQuery);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processAIQuery(); });

function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="msg-avatar"><i class="fa-solid ${sender==='ai'?'fa-robot':'fa-user'}"></i></div><div class="msg-bubble"></div>`;
    
    // Security Fix: Prevent XSS by using textContent for user input, innerHTML for controlled AI output
    if (sender === 'ai') {
        msgDiv.querySelector('.msg-bubble').innerHTML = text;
    } else {
        msgDiv.querySelector('.msg-bubble').textContent = text;
    }
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function processAIQuery() {
    const query = searchInput.value.trim();
    if (!query) return;
    addChatMessage('user', query);
    chatContext.push({ role: 'user', content: query });
    searchInput.value = '';
    
    setTimeout(() => {
        let response = "";
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('where am i') || lowerQuery.includes('locate me')) {
            document.getElementById('locate-me-btn').click();
            return; 
        }
        else if (lowerQuery.includes('food') || lowerQuery.includes('hungry')) {
            response = `I analyzed the stalls. <b>Food Court A</b> is currently busy. However, <b>Snacks Kiosk B</b> is completely free right now. Shall I route you there?`;
            if(map) map.panTo({ lat: 23.0928, lng: 72.5980 });
        }
        else if (lowerQuery.includes('yes') && chatContext[chatContext.length-1].content.includes('food')) {
            response = `Great! I've routed you to Snacks Kiosk B. It's about a 2-minute walk from your location.`;
        }
        else if (lowerQuery.includes('gate') || lowerQuery.includes('crowd')) {
            response = `<b>Gate 2 (North)</b> is experiencing heavy traffic. The Load Balancer has automatically restricted new routing to this gate. Please use <b>Gate 1</b>.`;
        }
        else {
            response = `I am tracking live telemetry. The stadium is operating at high capacity. Use the "Auto-Route" button on the map to find the fastest paths.`;
        }
        addChatMessage('ai', response);
        chatContext.push({ role: 'ai', content: response });
    }, 1200);
}

setInterval(() => {
    STADIUM_DATA.gates.forEach(g => {
        if(g.id !== 'gate-2') { 
            g.load += Math.floor(Math.random() * 7) - 3; 
            if(g.load < 10) g.load = 10;
            if(g.load > 99) g.load = 99;
        }
    });
    renderUI();
}, 5000);

// ----------------------------------------------------
// Profile Modal System
// ----------------------------------------------------
const profileBtnToggle = document.querySelector('.profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('close-profile');
const saveProfileBtn = document.getElementById('save-profile');

if(profileBtnToggle && profileModal) {
    profileBtnToggle.addEventListener('click', () => profileModal.classList.add('active'));
    closeProfile.addEventListener('click', () => profileModal.classList.remove('active'));

    saveProfileBtn.addEventListener('click', () => {
        const name = document.getElementById('input-name').value;
        const block = document.getElementById('input-block').value;
        if (name) {
            displayName.innerText = name;
            
            // Add personalized notification to the Alerts Array
            STADIUM_DATA.alerts.unshift({
                id: Date.now(),
                title: `Welcome, ${name}!`,
                desc: `Your routing is optimized for ${block || 'your ticket'}.`,
                urgent: false
            });
            
            unreadCount++;
            renderUI();
            
            // Let the user know visually by opening the dropdown
            setTimeout(() => document.getElementById('notif-bell').click(), 500);
            addChatMessage('ai', `Profile updated, ${name}! I've optimized your routes for ${block || 'your seat'}.`);
        }
        profileModal.classList.remove('active');
    });
}
