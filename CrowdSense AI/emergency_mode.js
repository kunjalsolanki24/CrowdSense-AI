// emergency_mode.js - Isolated Emergency & Incident Module

/**
 * 1. Firebase Live Update Simulation
 * Decouples the emergency triggers from the main app logic using an event-driven architecture.
 */
class FirebaseSimulator {
    constructor() {
        this.listeners = [];
        console.log("[Firebase WSS] Connection Established. Listening for incidents...");
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
    }
    
    triggerIncident(payload) {
        console.warn("[Firebase WSS] INCOMING EMERGENCY PAYLOAD:", payload);
        this.listeners.forEach(cb => cb(payload));
    }
}

// Global instance for the simulation
window.mockFirebase = new FirebaseSimulator();

/**
 * 2. Emergency UI & AI Controller
 * Handles the lockdown state, AI interruptions, and global broadcasts without refactoring app.js.
 */
const EmergencyController = {
    init() {
        // Subscribe to our mocked Firebase stream
        window.mockFirebase.subscribe(this.handleIncident.bind(this));
        
        // Automate the incident trigger 15 seconds after app load (Simulation)
        setTimeout(() => {
            window.mockFirebase.triggerIncident({
                type: 'CROWD_CRUSH',
                zoneId: 'gate-2',
                msg: 'Critical Overcrowding Surge Detected at Gate 2 (North).'
            });
        }, 15000);
    },



    handleIncident(payload) {
        // A. Isolate & Modify STADIUM_DATA
        if (typeof STADIUM_DATA !== 'undefined') {
            const gate = STADIUM_DATA.gates.find(g => g.id === payload.zoneId);
            if (gate) {
                gate.status = 'critical';
                gate.load = 100;
                gate.name = "🚨 " + gate.name + " (LOCKED)";
                gate.crowded = true;
            }
            
            // Inject into Alerts
            STADIUM_DATA.alerts.unshift({
                id: Date.now(), title: 'EMERGENCY: ' + payload.type, desc: payload.msg, urgent: true
            });
        }

        // B. Force Core UI Updates
        if (typeof renderUI === 'function') renderUI();
        if (typeof unreadCount !== 'undefined') {
            unreadCount++;
            renderUI();
        }

        // C. Map Polygon Update (If Map exists)
        if (typeof map !== 'undefined' && typeof google !== 'undefined') {
            if (typeof renderMapPolygons === 'function') renderMapPolygons();
            // Pan to the incident
            const incidentCoords = { lat: 23.0935, lng: 72.5975 }; // Gate 2
            map.panTo(incidentCoords);
            map.setZoom(18);
        }

        // D. Instant AI Rerouting (Interrupt User Workflow)
        if (typeof addChatMessage === 'function') {
            addChatMessage('ai', `<span style="color:#ef4444; font-weight:800;">⚠️ EMERGENCY OVERRIDE:</span> ${payload.msg} Access to this zone is immediately restricted. Calculating alternate exit vectors...`);
        }
        
        // Trigger auto-route 2 seconds after the warning to simulate AI calculation
        setTimeout(() => {
            if (typeof autoRouteUser === 'function') autoRouteUser();
        }, 2000);
        
        // Visual cue on the notification bell
        const bell = document.getElementById('notif-bell');
        if(bell) {
            bell.style.color = '#ef4444';
        }
    }
};

// Initialize after DOM is fully loaded to ensure app.js is ready
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure app.js elements are mounted
    setTimeout(() => EmergencyController.init(), 500);
});
