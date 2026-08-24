import { Routes, Route } from "react-router-dom";
import { Header, Footer, FloatingActions } from "./components/Layout";
import { SolucoesPage } from "./pages/Solucoes";
import { DomosPage } from "./pages/Domos";
import ObeliscoRadicalSite from "./App";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ObeliscoRadicalSite />} />
          <Route path="/solucoes" element={<SolucoesPage />} />
          <Route path="/domos" element={<DomosPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
