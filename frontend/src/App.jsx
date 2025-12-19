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
  const socketRef = useRef(null);

  useEffect(() => {
    // Connexion au backend Socket.IO
    const socket = io("http://localhost:3004");
    socketRef.current = socket;

    socket.on("connect", () => {
      setBackendUp(true);
      console.log("✅ Connecté au backend");
    });

    socket.on("disconnect", () => {
      setBackendUp(false);
      console.warn("⚠️ Déconnecté du backend");
    });

    // Réception des mises à jour de l'encodeur depuis le backend
    socket.on("encoderUpdate", (data) => {
      if (data) {
        setEncoderData({
          rotation: data.rotation || "Arrêté",
          speed: data.speed || 0,
          isOn: data.isOn || false
        });
      }
    });

    // Déconnexion à la destruction du composant
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Activer l'encodeur
  const handleOn = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("encoderOn");
      console.log("✅ Encodeur activé");
    } else {
      console.warn("Socket non connecté");
    }
  };

  // Désactiver l'encodeur
  const handleOff = () => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("encoderOff");
      console.log("❌ Encodeur désactivé");
    } else {
      console.warn("Socket non connecté");
    }
  };

  return (
    <div className="app">

      <div className="main-container">
        <div className="backend-status">Backend: {backendUp ? "✅ Up" : "⚠️ Down"}</div>
        
        <div className="encoder-container">
          <h1 className="title">⚙️ Control Motor ⚙️</h1>
          <div className="encoder-info">
            <div className="info-item">
              <label>Sens de rotation:</label>
              <span className="value">{encoderData.rotation}</span>
            </div>
            <div className="info-item">
              <label>Vitesse:</label>
              <span className="value">{encoderData.speed} RPM</span>
            </div>
            <div className="info-item">
              <label>Statut:</label>
              <span className={`value ${encoderData.isOn ? "on" : "off"}`}>
                {encoderData.isOn ? "🟢 ON" : "🔴 OFF"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button className="btn on" onClick={handleOn} disabled={encoderData.isOn}>
          🟢 ON
        </button>
        <button className="btn off" onClick={handleOff} disabled={!encoderData.isOn}>
          🔴 OFF
        </button>
      </div>
    </div>
  );
}

export default App;
