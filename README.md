# TransitIQ — Intelligent Campus Transport Optimization Platform

<div align="center">

**Move Campus Forward.**

A full-stack, constraint-aware campus transit optimization platform with live simulated telemetry, automated hard-constraint verification, and reproducible baseline comparisons under fluctuating passenger demand and operational disruptions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10-green)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)

</div>

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Hard Constraints](#-hard-constraints)
- [Installation](#-installation)
- [Usage](#-usage)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Capabilities

- **Real-Time Operations Dashboard** - Live shuttle tracking with GPS telemetry, occupancy metrics, and route status
- **Demand Intelligence** - Heatmap analysis of passenger demand patterns across time and locations
- **Route Optimization** - MILP-based solver with 7 hard-constraint validation
- **Performance Analytics** - Comparative analysis between baseline and optimized schedules
- **Disruption Simulation** - Stress-test scenarios for class rushes, construction delays, and vehicle breakdowns
- **Fleet Management** - Complete route directory and vehicle fleet tracking

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework:** React 18 with Vite
- **State Management:** React hooks
- **Visualization:** Recharts, Leaflet maps
- **Styling:** CSS with custom design tokens

### Backend (Python + FastAPI)
- **Framework:** FastAPI with async support
- **Optimization:** Custom MILP solver
- **ETA Engine:** Machine learning-based prediction
- **Testing:** Pytest with comprehensive coverage

### Key Pages

1. **Overview** - Operations homepage with status summary and route visualization
2. **Live Operations** - Real-time map with shuttle tracking and simulation controls
3. **Demand Intelligence** - Heatmap analysis and demand forecasting
4. **Route Optimizer** - MILP solver with constraint validation
5. **Performance Lab** - Comparative analytics and stress testing
6. **Routes & Fleet** - Fleet management and route configuration

## 🚦 Hard Constraints

The optimizer enforces 7 non-negotiable hard constraints:

1. **$C_1$ — Strict Vehicle Capacity** ($O_v \le C_v$)
   - Certified passenger limit enforced on every shuttle

2. **$C_2$ — No Impossible Trips**
   - Route cycle time: $T_{\text{cycle}} \ge \sum t_{\text{seg}} + \Delta_{\text{turnaround}}$ (≥3 min turnaround)

3. **$C_3$ — Vehicle Availability & Health**
   - Depleted (<15%) or maintenance vehicles cannot be scheduled

4. **$C_4$ — Departure Window & Headway Bounds**
   - $5\text{ min} \le h_r \le 40\text{ min}$ to prevent service collapse

5. **$C_5$ — Non-Overlapping Assignments**
   - Single vehicle cannot be assigned to overlapping routes

6. **$C_6$ — Conservation of Unmet Demand**
   - Passengers exceeding capacity tracked and penalized

7. **$C_7$ — Route Topology & Connectivity**
   - Stop sequences must follow connected campus graph segments

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Git

### Option A: Full-Stack Development (Recommended)

```powershell
# Clone the repository
git clone https://github.com/Tanya-garg10/TransitIQ-AI-Powered-Campus-Transport-Optimization.git
cd TransitIQ-AI-Powered-Campus-Transport-Optimization

# Install frontend dependencies
npm install

# Start the development server (port 3000)
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### Option B: Backend Only

```powershell
# Clone the repository
git clone https://github.com/Tanya-garg10/TransitIQ-AI-Powered-Campus-Transport-Optimization.git
cd TransitIQ-AI-Powered-Campus-Transport-Optimization

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r backend/requirements.txt

# Run FastAPI server (port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

API documentation available at **`http://localhost:8000/docs`**

## 🚀 Usage

### Running the Application

**Development Mode:**
```powershell
npm run dev
```

**Production Build:**
```powershell
npm run build
npm run preview
```

### API Endpoints

- `GET /api/routes` - List all routes
- `GET /api/vehicles` - Get fleet status
- `POST /api/optimize` - Run route optimization
- `GET /api/eta/{route_id}` - Get ETA predictions
- `GET /api/demand` - Get demand analytics

### Simulation Controls

The Live Operations page includes:
- ▶️ Play/Pause simulation
- ⏩ Speed multiplier (1x, 2x, 5x)
- ⏭️ Advance time (+5 minutes)
- 🔄 Reset simulation

## 🧪 Testing

### Backend Tests

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run all tests
python backend/tests/run_tests.py
```

### Test Coverage

- ✅ Capacity constraint violation detection
- ✅ Impossible trip detection
- ✅ Hard constraints validation
- ✅ Dataset integrity
- ✅ Optimizer execution
- ✅ ETA MAE computation

**Current Status:** 6/6 tests passing (0.008s execution time)

## 📁 Project Structure

```
transitiq/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI application
│   ├── data/
│   │   └── campus_dataset.py # Campus data models
│   ├── models/
│   │   └── transit.py       # Data models
│   ├── services/
│   │   ├── eta_engine.py    # ETA prediction
│   │   └── optimizer.py     # Route optimization
│   ├── tests/
│   │   ├── run_tests.py     # Test runner
│   │   ├── test_api.py      # API tests
│   │   ├── test_eta.py      # ETA tests
│   │   └── test_optimizer.py # Optimizer tests
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── data/               # Mock data
├── index.html              # Entry HTML
├── package.json            # Node dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── README.md               # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Tanya Garg**

## 🙏 Acknowledgments

- Built with React, TypeScript, and FastAPI
- Inspired by real-world campus transportation challenges
- Design system inspired by modern mobility platforms

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
