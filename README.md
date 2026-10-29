# Industrial IoT Monitoring Platform

A web-based industrial monitoring prototype built with React, Node.js, Express and Socket.IO.

The application provides a dashboard for monitoring and controlling a simulated motor/encoder system in real time. Its architecture is designed to support future integration with industrial automation equipment through OPC UA.

> **Project status:** Prototype running in simulation mode. A physical PLC is not required. OPC UA integration is not enabled in the current configuration.

## Features

- Real-time dashboard updates using Socket.IO
- REST API for reading and updating encoder state
- Simulated motor start and stop commands
- Display of motor status, speed and rotation
- React-based web interface
- Backend structured for future industrial communication integration

## Architecture

```text
React Dashboard
      |
      | REST API / Socket.IO
      v
Node.js + Express Backend
      |
      +---- Motor/Encoder Simulator
      |
      +---- Optional OPC UA Integration
```

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express |
| Real-time communication | Socket.IO |
| Industrial communication | node-opcua (optional integration) |
| Simulation | Software-based motor/encoder state |

## Getting Started

### Prerequisites

- Node.js
- npm

### 1. Clone the repository

```bash
git clone https://github.com/kaoutherAbbas/web.git
cd web
```

### 2. Install and start the backend

```bash
cd backend
npm install
npm start
```

The backend runs at:

`http://localhost:3004`

Keep this terminal open.

### 3. Install and start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm start
```

The dashboard should be available at:

`http://localhost:3000`

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/encoder` | Retrieve the current encoder state |
| POST | `/encoder` | Update the encoder state |

Example request:

```bash
curl http://localhost:3004/encoder
```

## Roadmap

- [ ] Add automated backend tests
- [ ] Store telemetry history in a database
- [ ] Add charts and event history to the dashboard
- [ ] Improve input validation and error handling
- [ ] Document the API
- [ ] Add continuous integration with GitHub Actions
- [ ] Implement and validate OPC UA communication with a real PLC

## Limitations

The current prototype uses a software simulation. It has not been validated as a safety-rated industrial control system. Real PLC communication and physical equipment integration require separate configuration and testing.

## License

No open-source license has been selected yet.
