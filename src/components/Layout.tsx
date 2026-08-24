import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ElectricalAssistant from "./ElectricalAssistant";
import { Menu, X, MessageCircle, Zap } from "lucide-react";

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="Obelisco Radical Eletricidade"
        className="h-14 w-auto rounded-lg object-contain mix-blend-lighten sm:h-16"
      />
    </div>
  );
}

function scrollToSection(id: string) {
  const elem = document.getElementById(id);
  if (elem) {
    elem.scrollIntoView({ behavior: "smooth" });
  }
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Home page nav: scroll links
  // Other pages: navigation
  const nav = [
    { label: "Início", id: "hero", href: "/#hero" },
    { label: "Serviços", id: "services", href: "/#services" },
    { label: "Planos", id: "planos", href: "/#planos" },
    { label: "Vantagens", id: "vantagens", href: "/#vantagens" },
    { label: "Contacto", id: "contact", href: "/#contact" },
  ];

  const handleNavClick = (item: { label: string; id: string; href: string }) => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      scrollToSection(item.id);
    } else {
      // Navigate via href for cross-route navigation
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = item.href;
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-left">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="text-sm font-medium text-zinc-400 transition hover:text-yellow-400"
            >
              {item.label}
            </button>
          ))}

          {/* Obelisco Labs — novo item */}
          <Link
            to="/labs"
            className="text-sm font-medium text-zinc-400 transition hover:text-yellow-400"
          >
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-500/60 hover:bg-violet-500/20 transition">
              🔬 Obelisco Labs
            </span>
          </Link>

          <a
            href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
            className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            WhatsApp direto
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-xl border border-zinc-800 p-2 text-zinc-300 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="space-y-3">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="block w-full rounded-xl px-3 py-3 text-left text-zinc-300 transition hover:bg-zinc-900 hover:text-yellow-400"
              >
                {item.label}
              </button>
            ))}

            <Link
              to="/labs"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-xl px-3 py-3 text-left text-zinc-300 transition hover:bg-zinc-900 hover:text-yellow-400"
            >
              🔬 Obelisco Labs
            </Link>

            <a
              href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
              className="block w-full rounded-2xl bg-yellow-400 px-5 py-3 text-center font-semibold text-zinc-950"
            >
              WhatsApp direto
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>© {new Date().getFullYear()} Obelisco Radical Eletricidade</span>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
          <div>
            <div className="text-white font-semibold">Obelisco Radical</div>
            <div className="text-xs text-zinc-500">Serviços técnicos</div>
            <Link to="/" className="text-zinc-500 hover:text-yellow-400 text-xs">
              Voltar ao site principal
            </Link>
          </div>

          <div>
            <div className="text-white font-semibold">Obelisco Labs</div>
            <div className="text-xs text-zinc-500">Produtos digitais</div>
            <Link to="/labs" className="text-zinc-500 hover:text-violet-400 text-xs">
              Acessar divisão de tecnologia
            </Link>
          </div>

          <div>
            <div>Instagram: @obeliscoradical</div>
            <div>www.obeliscoradical.pt</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FloatingActions() {
  return (
    <>
      <a
        href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
        className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full bg-green-500 px-5 py-4 font-semibold text-white shadow-2xl shadow-green-500/20 transition hover:bg-green-400"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        WhatsApp
      </a>

      <ElectricalAssistant />
    </>
  );
}

