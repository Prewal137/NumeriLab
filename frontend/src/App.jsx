import { useEffect, useState } from "react";
import "./App.css";
import { healthCheck } from "./services/api";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ModulePage } from "./pages/ModulePage";
import { MethodPage } from "./pages/MethodPage";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    if (method && method.module) {
      setSelectedModule(method.module);
    }
    setActiveTab("method-detail");
  };

  const handleBackToModules = () => {
    setActiveTab("modules");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "method-detail") {
      setSelectedMethod(null);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        backendStatus={backendStatus}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedModule={selectedModule}
        onSelectModule={handleSelectModule}
        activeTab={activeTab}
        onNavigateTab={handleTabChange}
      />

      <div className="main-layout">
        <main className="main-content">
          {activeTab === "dashboard" && (
            <Dashboard
              backendStatus={backendStatus}
              onSelectMethod={handleSelectMethod}
              onSelectModule={handleSelectModule}
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
              key={selectedMethod.id}
              method={selectedMethod}
              onBack={handleBackToModules}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;