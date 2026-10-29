const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const {
  saveTelemetry,
  getRecentTelemetry
} = require("./database");


// Pour OPC UA (à activer si le PLC est disponible)
const { OPCUAClient, AttributeIds, TimestampsToReturn } = require("node-opcua");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// ⚡ État de l'encodeur
let encoderState = {
  isOn: false,
  rotation: "Arrêté",
  speed: 0
};

// Intervalle de simulation de l'encodeur
let encoderInterval = null;

// ===== Historique SQLite =====
function recordTelemetry() {
  try {
    saveTelemetry(encoderState);
  } catch (err) {
    console.error("Erreur enregistrement SQLite :", err.message);
  }
}
// ===== OPC UA (Optionnel) =====
const USE_OPCUA = false; // passer à true si on connecte le PLC
const PLC_ENDPOINT = "opc.tcp://PLC_IP:4840"; // remplacer PLC_IP par l'IP du PLC
let opcClient = null;
let session = null;

async function connectPLC() {
  if (!USE_OPCUA) return;
  opcClient = OPCUAClient.create({ endpointMustExist: false });
  await opcClient.connect(PLC_ENDPOINT);
  session = await opcClient.createSession();
  console.log("✅ Connecté au PLC via OPC UA");
}

async function readPLC() {
  if (!session) return;
  try {
    const nodesToRead = [
      { nodeId: "ns=3;s=\"DB_Encoder\".\"Encoder_On\"", attributeId: AttributeIds.Value },
      { nodeId: "ns=3;s=\"DB_Encoder\".\"Speed_RPM\"", attributeId: AttributeIds.Value },
      { nodeId: "ns=3;s=\"DB_Encoder\".\"Direction\"", attributeId: AttributeIds.Value }
    ];
    const data = await session.read(nodesToRead, 0, TimestampsToReturn.Neither);
    encoderState.isOn = data[0].value.value;
    encoderState.speed = data[1].value.value;
    encoderState.rotation = data[2].value.value ? "Anti-horaire" : "Horaire";
  } catch (err) {
    console.error("Erreur lecture PLC:", err.message);
  }
}

async function writePLC(isOn) {
  if (!session) return;
  try {
    await session.writeSingleNode(
      "ns=3;s=\"DB_Encoder\".\"Encoder_On\"",
      { dataType: "Boolean", value: isOn }
    );
  } catch (err) {
    console.error("Erreur écriture PLC:", err.message);
  }
}

// ===== Simulation encodeur =====
function startEncoder() {
  if (encoderState.isOn) return;
  encoderState.isOn = true;
  let speedCounter = 0;
  recordTelemetry();

  encoderInterval = setInterval(async () => {
    //mockingggggggggggggggggggggggggggggggggggggggg
    if (!USE_OPCUA) {
      // Simulation locale
      if (speedCounter < 100) speedCounter += 10;
      encoderState.speed = speedCounter;
      encoderState.rotation = "Horaire";
    } 
    //fin mockinggggggggggggggggggggggggggggg
    else {
      // Lire depuis le PLC
      await readPLC();
    }
     recordTelemetry();
    io.emit("encoderUpdate", encoderState);
  }, 500);

  io.emit("encoderUpdate", encoderState);

  // Si OPC UA, écrire l'état ON dans le PLC
  if (USE_OPCUA) writePLC(true);
  recordTelemetry();

}

function stopEncoder() {
  if (encoderInterval) {
    clearInterval(encoderInterval);
    encoderInterval = null;
  }

  encoderState.isOn = false;
  encoderState.speed = 0;
  encoderState.rotation = "Arrêté";
  recordTelemetry();
  io.emit("encoderUpdate", encoderState);

  if (USE_OPCUA) writePLC(false);
}

// ===== REST API =====
// Consulter les dernières mesures enregistrées
app.get("/telemetry", (req, res) => {
  const requestedLimit = Number(req.query.limit ?? 100);

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    return res.status(400).json({
      success: false,
      message: "Le paramètre limit doit être un entier positif."
    });
  }

  try {
    const history = getRecentTelemetry(requestedLimit);

    res.json({
      success: true,
      count: history.length,
      telemetry: history
    });
  } catch (err) {
    console.error("Erreur lecture historique :", err.message);

    res.status(500).json({
      success: false,
      message: "Impossible de lire l'historique."
    });
  }
});
app.get("/encoder", (req, res) => res.json(encoderState));
app.post("/encoder", (req, res) => {
  const { isOn } = req.body;
  if (isOn !== undefined) {
    isOn ? startEncoder() : stopEncoder();
  }
  res.json({ success: true, encoderState });
});

// ===== SOCKET.IO =====
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("🔌 Client connecté:", socket.id);
  socket.emit("encoderUpdate", encoderState);

  socket.on("encoderOn", () => startEncoder());
  socket.on("encoderOff", () => stopEncoder());

  socket.on("disconnect", () => console.log("❌ Client déconnecté:", socket.id));
});

// ===== START SERVER =====
server.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  if (USE_OPCUA) await connectPLC();
});
