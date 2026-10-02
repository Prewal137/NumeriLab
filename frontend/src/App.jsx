import { useEffect, useState } from "react";
import { healthCheck } from "./services/api";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import { MethodPage } from "./pages/MethodPage";
import { VerificationPage } from "./pages/VerificationPage";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await healthCheck();

        if (data.status === "ok") {
          setBackendStatus("Connected");
        } else {
          setBackendStatus("Unexpected Response");
        }
      } catch (error) {
        console.error("Backend connection failed:", error);
        setBackendStatus("Disconnected");
      }
    };

    checkBackend();
  }, []);

  const handleSelectModule = (moduleId) => {
    setSelectedModule(moduleId);
    setSelectedMethod(null);
    setActiveTab("modules");
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setActiveTab("method-detail");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0b0f19",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "method-detail") {
            setSelectedMethod(null);
          }
        }}
      />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar
          selectedModule={selectedModule}
          onSelectModule={handleSelectModule}
        />

        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {activeTab === "dashboard" && (
            <Dashboard
              backendStatus={backendStatus}
              onSelectMethod={handleSelectMethod}
            />
          )}

          {activeTab === "modules" && (
            <ModulePage
              moduleId={selectedModule}
              onSelectMethod={handleSelectMethod}
              onBack={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "method-detail" && selectedMethod && (
            <MethodPage
              method={selectedMethod}
              onBack={() => setActiveTab("modules")}
            />
          )}

          {activeTab === "verification" && <VerificationPage />}
        </main>
      </div>
    </div>
  );
}

export default App;