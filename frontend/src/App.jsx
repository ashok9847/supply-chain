import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SalesAnalysis from "./pages/SalesAnalysis";
import DeliveryAnalysis from "./pages/DeliveryAnalysis";
import GeographicAnalysis from "./pages/GeographicAnalysis";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<SalesAnalysis />} />
            <Route path="/delivery" element={<DeliveryAnalysis />} />
            <Route path="/geographic" element={<GeographicAnalysis />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
