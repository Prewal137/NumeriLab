import { useEffect, useState } from "react";
import { healthCheck } from "./services/api";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await healthCheck();

        if (data.status === "ok") {
          setBackendStatus("Connected");
          setBackendMessage(data.message || "NumeriLab API is running");
        } else {
          setBackendStatus("Unexpected Response");
        }
      } catch (error) {
        console.error("Backend connection failed:", error);
        setBackendStatus("Disconnected");
        setBackendMessage("Unable to connect to NumeriLab API");
      }
    };

    checkBackend();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>NumeriLab</h1>

        <p>Interactive Numerical Methods Analysis & Visualization Platform</p>

        <h2>
          Backend Status:{" "}
          <span
            style={{
              color: backendStatus === "Connected" ? "green" : "red",
            }}
          >
            {backendStatus}
          </span>
        </h2>

        <p>{backendMessage}</p>
      </div>
    </div>
  );
}

export default App;