# TransitIQ — Intelligent Campus Transport Optimization Platform
**Tagline:** *"Move Campus Forward."*  
**Problem Statement:** *RoutePulse: Optimise Campus Transport Under Real Constraints*

TransitIQ is a full-stack, constraint-aware campus transit optimization platform with an editorial mobility control identity, live simulated telemetry, automated hard-constraint verification, and reproducible baseline comparisons under fluctuating passenger demand and operational disruptions.

---

## 1. Creative Direction & Brand System

- **Palette:**
  - **Midnight Ink:** `#101820` (primary dark surface)
  - **Warm Ivory:** `#F7F6F0` (editorial contrast text & surfaces)
  - **Electric Lime:** `#D8FF3E` (accent, active indicator, primary CTA)
  - **Slate Grey:** `#69737D` (subtle metrics, labels, borders)
  - **Pure White:** `#FFFFFF` (high-contrast headers & callouts)
  - **Muted Alert Tones:** Alert Red `#E04838`, Muted Amber `#E58B20` (exclusively for active operational warnings)
- **Typography:**
  - **Headlines:** `Space Grotesk` (geometric high-character display sans-serif)
  - **Interface & Data:** `Inter` (neutral, legible tabular UI)
  - **Telemetry & Numbers:** `JetBrains Mono` (precise tabular figures)

---

## 2. Six Distinct Page Architectures

1. **PAGE A — Overview: "Move Campus Forward"**
   - Editorial operations homepage with large geometric headline.
   - Concise operational status statement derived from live state.
   - Stylized interactive campus route visualization as the central schematic.
   - Compact horizontal operational metrics strip.
   - Priority alert rail for delays, overcrowding, and unmet demand.
   - Distinctive baseline-versus-optimized performance preview.

2. **PAGE B — Live Operations: "The Network, Now"**
   - Map-first interface with large Leaflet canvas (CartoDB Dark Matter).
   - Route polylines and stop markers with waiting queues.
   - Simulated shuttles with dynamic occupancy meters, speed, bearing, and next stop.
   - Precision telemetry drawer with driver info, battery SoC, and GPS timestamps.
   - Working simulation controls: play, pause, reset, +5m advance, and speed multiplier (1x, 2x, 5x).

3. **PAGE C — Demand Intelligence: "Where Demand Builds"**
   - Stop-by-time demand heatmap matrix (rows: stops, cols: 08:00 to 20:00).
   - Ranked stops with highest passenger demand.
   - Horizontal capacity-versus-occupancy bars.
   - Stop drilldown card showing localized shelter crowding and serving corridors.
   - Interactive zone and time slot filters.

4. **PAGE D — Route Optimizer: "Make Every Trip Count"**
   - Action-oriented solver workspace.
   - Objective statement: $\min J = 1.0\cdot\text{Wait} + 4.5\cdot\text{UnmetDemand} + 0.8\cdot\text{HeadwayVar} + 1.2\cdot\text{FleetCost}$.
   - Electric Lime "Run Optimization" action triggering deterministic MILP solver.
   - Side-by-side comparison of current and proposed schedules.
   - Visual departure timeline showing departures across the hour.
   - Recommendation cards with reasons, expected benefits, and operational trade-offs.
   - 7/7 hard-constraint validation audit.

5. **PAGE E — Performance Lab: "Prove the Difference"**
   - Analytical experiment report layout.
   - Large headline metrics with absolute and percentage deltas.
   - Recharts comparative bar chart for waiting time, unmet demand, and ETA error.
   - Scenario stress-test selector (Class Rush $+140\%$, Construction Delay $+12\text{m}$, Engine Breakdown, GPS Loss).
   - Mathematical evaluation methodology explanation and CSV export.

6. **PAGE F — Routes and Fleet**
   - Information-dense operational management layout.
   - Route directory with visual line signatures, cycle times, and headways.
   - Vehicle fleet table with capacity, occupancy, assignment, and battery state.
   - Expandable route details with ordered stops and segment travel times.
   - Validated forms for adding new routes and transit stops.

---

## 3. The 7 Non-Negotiable Hard Constraints

1. **$C_1$ — Strict Vehicle Capacity ($O_v \le C_v$):** Certified passenger limit enforced on every shuttle.
2. **$C_2$ — No Impossible Trips:** Route cycle time must satisfy $T_{\text{cycle}} \ge \sum t_{\text{seg}} + \Delta_{\text{turnaround}}$ ($\ge 3$ min minimum turnaround slack).
3. **$C_3$ — Vehicle Availability & Health:** Depleted ($<15\%$) or maintenance vehicles cannot be scheduled.
4. **$C_4$ — Departure Window & Headway Bounds:** $5\text{ min} \le h_r \le 40\text{ min}$ to prevent service collapse.
5. **$C_5$ — Non-Overlapping Assignments:** A single vehicle cannot be assigned to overlapping routes.
6. **$C_6$ — Conservation of Unmet Demand:** Passengers exceeding capacity are explicitly tracked and penalized.
7. **$C_7$ — Route Topology & Connectivity:** Stop sequences must follow connected campus graph segments.

---

## 4. Exact Windows PowerShell Commands

### Option A: Unified Full-Stack Dev Server (Port 3000)
```powershell
# 1. Install dependencies
npm install

# 2. Launch full-stack applet (Express + Vite on port 3000)
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option B: Standalone Python FastAPI Backend (Port 8000)
```powershell
# 1. Setup virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies & run unit tests
pip install -r backend/requirements.txt
python backend/tests/run_tests.py

# 3. Launch FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 5. Automated Test Results

Running `python backend/tests/run_tests.py`:
- `test_capacity_constraint_violation_detection`: **PASSED**
- `test_impossible_trip_detection`: **PASSED**
- `test_hard_constraints_validation_clean_pass`: **PASSED**
- `test_initial_dataset_integrity`: **PASSED**
- `test_optimizer_execution_and_deltas`: **PASSED**
- `test_eta_mae_computation`: **PASSED**

**Execution Time:** 6 tests ran in **0.008s** with **0 failures**.
