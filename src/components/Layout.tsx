import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

  // Home page nav: scroll links
  // Other pages: links to routes
  const nav = [
    { label: "Início", id: "hero", href: "/#hero" },
    { label: "Serviços", id: "services", href: "/#services" },
    { label: "Vantagens", id: "vantagens", href: "/#vantagens" },
    { label: "FAQ", id: "faq", href: "/#faq" },
    { label: "Contacto", id: "contact", href: "/#contact" },
  ];

  const handleNavClick = (item: { label: string; id: string; href: string }) => {
    if (location.pathname === "/") {
      scrollToSection(item.id);
      setMenuOpen(false);
    } else {
      // Navigate to home and scroll on load
      navigate("/" + item.href);
      setMenuOpen(false);
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

          <Link
            to="/solucoes"
            className="text-sm font-medium text-zinc-400 transition hover:text-yellow-400"
          >
            Soluções Digitais
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
              to="/solucoes"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-xl px-3 py-3 text-left text-zinc-300 transition hover:bg-zinc-900 hover:text-yellow-400"
            >
              Soluções Digitais
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
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>© {new Date().getFullYear()} Obelisco Radical Eletricidade</span>
        </div>

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-8 sm:text-right">
          <div>
            <div className="text-white">Soluções Digitais</div>
            <Link to="/solucoes" className="text-zinc-500 hover:text-yellow-400">
              DOMOS
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
