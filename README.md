# CrowdSense-AI
Predictive Crowd Intelligence for Live Events

# CrowdSense AI
## Vertical
**Live Events & Stadium Crowd Management.** 
CrowdSense AI is designed specifically for large-scale live events (such as matches at the Narendra Modi Stadium) to optimize crowd flow, prevent overcrowding, and enhance visitor experience through intelligent routing and real-time alerts.

## Approach & Logic
- **Predictive & Reactive Routing:** The application calculates optimal paths for attendees by monitoring live traffic loads at various stadium gates and amenities. It actively re-routes users away from congested areas (e.g., Gate 2) towards optimal paths (e.g., Gate 1 or VIP).
- **Simulated Real-Time Data (Event-Driven Architecture):** An isolated `emergency_mode.js` script leverages a `FirebaseSimulator` to mock real-time WebSocket/Firebase events, allowing the application to react to live emergencies without needing a full backend during the prototype phase.
- **Context-Aware AI Assistant:** An AI coordinator analyzes natural language queries (like "Where am I?" or "Nearest free food stall?") and ties them directly into the map UI, panning to locations and suggesting routes based on current heatmap data.
- **Dynamic Load Balancing:** Gate loads dynamically fluctuate over time. The system listens for these changes and balances the crowd by adjusting wait times and warning states on the fly.

## How the Solution Works
1. **Onboarding & Profiling:** Users authenticate via a premium launch sequence. They can update their profiles with ticket blocks and accessibility needs, allowing the system to customize their routing logic.
2. **Live 3D Map Interface:** Integrated with the Google Maps API (Satellite View), the map uses interactive, color-coded polygons to show the real-time status of gates (Safe, Warning, Critical). Users can view the map in 2D or a tilted 3D perspective.
3. **Intelligence Panel:** 
   - **AI Chat:** Users interact with an AI to get suggestions or find amenities.
   - **Gate Telemetry:** Displays live wait times and congestion loads.
   - **Amenities Heatmap:** Shows which food or medical stalls are currently busy or free.
4. **Emergency Lockdown (Simulation):** Roughly 15 seconds after initialization, the system simulates a "CROWD_CRUSH" event. The AI override kicks in, instantly locking down the affected gate visually on the map and UI, triggering urgent notifications, and automatically rerouting the user to safety.

## Assumptions Made
- **Static Map Data:** The polygon coordinates for the gates and the stadium boundaries (Narendra Modi Stadium) are hardcoded for this MVP.
- **Simulated Backend:** There is currently no live backend connected; the `FirebaseSimulator` handles the mocked state management and event propagation.
- **Heuristic-Based Predictions:** Wait times are currently calculated as a linear function of the simulated gate load percentage (`Wait Time = Load / 5`).
- **Predefined NLP Intent:** The AI chat responses operate using basic keyword matching (e.g., "food", "gate") tailored for the demonstration, rather than a live LLM endpoint.
