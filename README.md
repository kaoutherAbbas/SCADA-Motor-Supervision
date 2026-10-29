# SCADA Motor Supervision

A web-based industrial motor supervision prototype built with React, Node.js, Express, Socket.IO, and SQLite.

The application provides a real-time dashboard for monitoring and controlling a **simulated motor/encoder system**. It displays motor status, rotation direction, speed, speed alerts, and historical telemetry.

> **Project status:** Prototype running in simulation mode. Physical motor control and real PLC communication are not currently enabled. OPC UA integration is intended for future development.

## Features

- Real-time motor state updates using Socket.IO
- Simulated motor start and stop commands
- Live display of motor speed, status, and rotation direction
- Speed threshold alerts
- Backend connection and supervision availability indicators
- Speed evolution chart
- Telemetry history stored in SQLite
- REST API for accessing encoder data and telemetry
- React-based dashboard
- Backend architecture prepared for future industrial communication integration

## Architecture

```text
React Dashboard
      |
      | Socket.IO / REST API
      v
Node.js + Express Backend
      |
      +---- Motor/Encoder Simulator
      |
      +---- SQLite Telemetry Database
      |
      +---- Optional OPC UA Integration
             (not enabled)
```

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Charts | Recharts |
| Backend | Node.js, Express |
| Real-time communication | Socket.IO |
| Database | SQLite |
| Industrial communication | node-opcua (optional integration) |
| Simulation | Software-based motor/encoder model |

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kaoutherAbbas/SCADA-Motor-Supervision.git
cd SCADA-Motor-Supervision
```

### 2. Start the backend

Open a terminal in the project directory:

```bash
cd backend
npm install
npm start
```

The backend is expected to run at:

`http://localhost:3004`

Keep this terminal open.

### 3. Start the frontend

Open a second terminal in the project directory:

```bash
cd frontend
npm install
npm start
```

The dashboard should be available at:

`http://localhost:3000`

## API

The backend exposes REST endpoints for encoder state and telemetry.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/encoder` | Retrieve the current encoder state |
| POST | `/encoder` | Update the encoder state |
| GET | `/telemetry?limit=20` | Retrieve recent telemetry records |

Example request:

```bash
curl http://localhost:3004/telemetry?limit=20
```

## Current Limitations

- Motor behavior is simulated in software.
- The speed alert threshold is a demonstration setting, not a certified industrial safety limit.
- OPC UA communication is not enabled in the current configuration.
- No physical PLC or motor integration has been validated.
- The prototype is not a safety-rated industrial control system.

## Roadmap

- [ ] Add automated backend tests
- [ ] Improve input validation and error handling
- [ ] Document API request and response formats
- [ ] Add continuous integration with GitHub Actions
- [ ] Implement and validate OPC UA communication with a real PLC
- [ ] Test integration with physical industrial equipment

## License

No open-source license has been selected yet.
