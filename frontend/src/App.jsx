
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [encoderData, setEncoderData] = useState({
    rotation: "Arrêté",
    speed: 0,
    isOn: false
  });

  const [backendUp, setBackendUp] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const socketRef = useRef(null);

  // Connexion temps réel au backend
  useEffect(() => {
    const socket = io("http://localhost:3004");
    socketRef.current = socket;

    socket.on("connect", () => setBackendUp(true));
    socket.on("disconnect", () => setBackendUp(false));

    socket.on("encoderUpdate", (data) => {
      if (data) {
        setEncoderData({
          rotation: data.rotation ?? "Arrêté",
          speed: data.speed ?? 0,
          isOn: data.isOn ?? false
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Charger l'historique SQLite toutes les 2 secondes
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:3004/telemetry?limit=20"
        );

        if (!response.ok) {
          throw new Error("Erreur HTTP " + response.status);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error("Lecture de l'historique impossible");
        }

        if (!cancelled) {
          setHistory(result.telemetry || []);
          setHistoryError("");
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError("Historique indisponible : " + error.message);
        }
      }
    };

    loadHistory();
    const intervalId = setInterval(loadHistory, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const handleOn = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("encoderOn");
    }
  };

  const handleOff = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("encoderOff");
    }
  };

  return (
    <div className="app">
      <header className="main-container">
        <div className="backend-status">
          Backend : {backendUp ? "🟢 Connecté" : "🔴 Déconnecté"}
        </div>

        <section className="encoder-container">
          <h1 className="title">Supervision moteur</h1>

          <div className="encoder-info">
            <div className="info-item">
              <label>Sens de rotation</label>
              <span className="value">{encoderData.rotation}</span>
            </div>

            <div className="info-item">
              <label>Vitesse</label>
              <span className="value">{encoderData.speed} RPM</span>
            </div>

            <div className="info-item">
              <label>Statut</label>
              <span
                className={`value ${encoderData.isOn ? "on" : "off"}`}
              >
                {encoderData.isOn ? "🟢 ON" : "🔴 OFF"}
              </span>
            </div>
          </div>
        </section>
      </header>

      <section className="controls">
        <button
          className="btn on"
          onClick={handleOn}
          disabled={!backendUp || encoderData.isOn}
        >
          🟢 Démarrer
        </button>

        <button
          className="btn off"
          onClick={handleOff}
          disabled={!backendUp || !encoderData.isOn}
        >
          🔴 Arrêter
        </button>
      </section>

      <section className="history-section">
        <div className="history-heading">
          <h2>Historique de télémétrie</h2>
          <span>{history.length} mesures affichées</span>
        </div>

        {historyError && (
          <p className="history-error">{historyError}</p>
        )}

        {!historyError && history.length === 0 && (
          <p>Aucune mesure enregistrée pour le moment.</p>
        )}

        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date et heure</th>
                <th>État</th>
                <th>Vitesse (RPM)</th>
                <th>Rotation</th>
              </tr>
            </thead>

            <tbody>
              {[...history].reverse().map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Date(item.timestamp).toLocaleString("fr-FR")}
                  </td>
                  <td>
                    <span
                      className={`value ${item.isOn ? "on" : "off"}`}
                    >
                      {item.isOn ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td>{item.speed}</td>
                  <td>{item.rotation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="history-note">
          Historique conservé dans SQLite · Actualisation toutes les 2 secondes
        </p>
      </section>
    </div>
  );
}

export default App;
