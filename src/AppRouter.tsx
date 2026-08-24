import { Routes, Route, Navigate } from "react-router-dom";
import { Header, Footer, FloatingActions } from "./components/Layout";
import ObeliscoRadicalSite from "./App";
import { LabsPage } from "./pages/Labs";
import { DomosPage } from "./pages/Domos";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Obelisco Radical — serviços técnicos */}
          <Route path="/" element={<ObeliscoRadicalSite />} />

          {/* Obelisco Labs — tecnologia e produtos digitais */}
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/labs/domos" element={<DomosPage />} />

          {/* Redirect legado: /domos → /labs/domos */}
          <Route path="/domos" element={<Navigate to="/labs/domos" replace />} />

          {/* 404 catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

