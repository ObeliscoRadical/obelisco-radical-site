import logo from "./assets/logo.png";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ElectricalAssistant from "./components/ElectricalAssistant";
import {
  Menu,
  X,
  Zap,
  ShieldCheck,
  Wrench,
  Cable,
  CircuitBoard,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  MessageCircle,
  Clock3,
  Building2,
  Home,
  Lightbulb,
  Plug,
  Award,
  ChevronRight,
  ArrowLeft,
  Calendar as CalendarIcon,
} from "lucide-react";

const services = [
  {
    id: "instalacao",
    title: "Instalações Elétricas",
    description:
      "Instalações elétricas completas para casas, apartamentos e empresas. Execução profissional com segurança e acabamento de qualidade.",
    icon: Plug,
    price: 50,
  },
  {
    id: "iluminacao",
    title: "Iluminação Interior e Exterior",
    description:
      "Projetos de iluminação funcional e decorativa com soluções LED. Mais eficiência, melhor estética e instalação segura.",
    icon: Lightbulb,
    price: 27.5,
  },
  {
    id: "manutencao",
    title: "Manutenção e Reparação",
    description:
      "Diagnóstico e reparação de falhas elétricas. Soluções rápidas para restaurar o funcionamento com segurança.",
    icon: Wrench,
    price: 37,
  },
  {
    id: "quadro",
    title: "Quadros Elétricos",
    description:
      "Instalação, substituição e organização de quadros elétricos. Mais segurança e melhor proteção para a instalação elétrica.",
    icon: CircuitBoard,
    price: 150,
  },
  {
    id: "cablagem",
    title: "Cablagem Estruturada",
    description:
      "Infraestrutura para energia, dados e telecomunicações. Soluções organizadas para ambientes residenciais e empresariais.",
    icon: Cable,
    price: 95,
  },
  {
    id: "seguranca",
    title: "Segurança e Inspeção",
    description:
      "Avaliação técnica e melhorias de segurança na instalação elétrica. Redução de riscos com acompanhamento profissional.",
    icon: ShieldCheck,
    price: 110,
  },
];

const highlights = [
  {
    icon: Clock3,
    title: "Resposta rápida",
    text: "Atendimento ágil para pedidos de orçamento e intervenções técnicas.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança em primeiro lugar",
    text: "Execução focada em qualidade técnica, proteção e confiança para o cliente.",
  },
  {
    icon: Award,
    title: "Serviço profissional",
    text: "Compromisso com qualidade, organização e atenção aos detalhes em cada atendimento.",
  },
];

const sectors = [
  {
    icon: Home,
    title: "Residencial",
    text: "Casas, apartamentos e condomínios.",
  },
  {
    icon: Building2,
    title: "Comercial",
    text: "Lojas, restaurantes, clínicas e escritórios.",
  },
  {
    icon: Zap,
    title: "Empresarial",
    text: "Projetos com foco em desempenho e fiabilidade.",
  },
];

const testimonials = [
  {
    name: "Cliente Residencial — Odivelas",
    text: "Atendimento rápido, trabalho limpo e excelente comunicação. Passa muita confiança.",
  },
  {
    name: "Cliente Comercial — Lisboa",
    text: "Serviço profissional do início ao fim. Resolveram tudo com rapidez e organização.",
  },
  {
    name: "Cliente Empresarial — Loures",
    text: "Precisávamos de resposta rápida e tivemos exatamente isso. Recomendo pela seriedade.",
  },
];

const faqs = [
  {
    q: "Atendem Lisboa e Cascais?",
    a: "Sim. A Obelisco Radical atua em Lisboa, Cascais e zonas próximas, mediante avaliação do serviço.",
  },
  {
    q: "Fazem orçamento rápido?",
    a: "Sim. O contacto pode ser feito por telefone, WhatsApp ou email para uma resposta inicial rápida.",
  },
  {
    q: "Trabalham com clientes residenciais e empresas?",
    a: "Sim. Atendemos moradias, apartamentos, comércios, escritórios e clientes empresariais.",
  },
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

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

function BookingModal({
  open,
  onClose,
  initialService,
}: {
  open: boolean;
  onClose: () => void;
  initialService?: string;
}) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState(initialService || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (open) setService(initialService || "");
  }, [initialService, open]);

  const serviceName = useMemo(
    () => services.find((s) => s.id === service)?.title || "",
    [service]
  );

  const normalizedModalPhone = phone.replace(/\s+/g, "");

  const resetAll = () => {
    setStep(0);
    setService("");
    setDate("");
    setTime("");
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setNotes("");
    setSubmitted(false);
    onClose();
  };

  const canNext =
    (step === 0 && !!service) || (step === 1 && !!date && !!time) || step === 2;

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    normalizedModalPhone.length >= 9 &&
    address.trim().length >= 5;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide text-white">
                {submitted ? "Pedido Confirmado" : "Pedir Orçamento"}
              </h3>
              <p className="text-sm text-zinc-400">
                Processo simples e profissional
              </p>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="space-y-5 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                <CheckCircle2 className="h-12 w-12" />
              </div>

              <h4 className="text-3xl font-black text-white">Pedido enviado</h4>

              <p className="mx-auto max-w-lg leading-7 text-zinc-300">
                Recebemos o seu pedido para{" "}
                <span className="font-semibold text-white">{serviceName}</span> no
                dia <span className="font-semibold text-white">{date}</span> às{" "}
                <span className="font-semibold text-white">{time}</span>.
                Entraremos em contacto o mais rápido possível.
              </p>

              <div className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
                Telefone / WhatsApp: +351 911 132 401
              </div>

              <div>
                <button
                  onClick={resetAll}
                  className="rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i <= step ? "bg-yellow-400" : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              {step === 0 && (
                <div>
                  <p className="mb-5 text-sm text-zinc-400">
                    Selecione o serviço desejado:
                  </p>

                  <div className="space-y-3">
                    {services.map((s) => {
                      const Icon = s.icon;
                      const active = service === s.id;

                      return (
                        <button
                          key={s.id}
                          onClick={() => setService(s.id)}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-yellow-400 bg-yellow-400/10"
                              : "border-zinc-800 bg-zinc-900 hover:border-yellow-500/40"
                          }`}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-yellow-400">
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white">
                              {s.title}
                            </div>
                            <div className="text-sm text-zinc-400">
                              {s.description}
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-yellow-300">
                            Desde €{s.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Data pretendida
                    </label>

                    <div className="relative">
                      <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-11 py-3 text-white outline-none transition focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Horário
                    </label>

                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    >
                      <option value="">Selecione o horário</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo"
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefone / WhatsApp"
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Morada do serviço"
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Descreva o serviço pretendido"
                    rows={4}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center rounded-2xl border border-zinc-800 px-5 py-3 font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <button
                    onClick={() => canNext && setStep((s) => s + 1)}
                    disabled={!canNext}
                    className="inline-flex items-center rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => canSubmit && setSubmitted(true)}
                    disabled={!canSubmit}
                    className="inline-flex items-center rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Enviar pedido
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ObeliscoRadicalSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const [cart, setCart] = useState<
    { id: string; title: string; price: number; quantity: number }[]
  >([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const nav = [
    { label: "Início", id: "hero" },
    { label: "Serviços", id: "services" },
    { label: "Vantagens", id: "vantagens" },
    { label: "FAQ", id: "faq" },
    { label: "Contacto", id: "contact" },
  ];

  const openBooking = (serviceId?: string) => {
    setSelectedService(serviceId);
    setBookingOpen(true);
  };

  const addToCart = (service: {
    id: string;
    title: string;
    price: number;
  }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === service.id);

      if (existing) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...service, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const travelFee = cart.length > 0 ? 35 : 0;
  const total = subtotal + travelFee;

  const handleCheckoutWhatsApp = () => {
    const normalizedCustomerPhone = customerPhone.replace(/\s+/g, "");

    if (
      cart.length === 0 ||
      !customerName ||
      normalizedCustomerPhone.length < 9 ||
      !customerAddress ||
      !selectedDate ||
      !selectedTime ||
      !paymentMethod
    ) {
      return;
    }

    const mapsLink = customerAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${customerAddress} ${customerPostalCode}`.trim()
        )}`
      : "";

    const paymentLabels: Record<string, string> = {
      mbway: "MB Way",
      transferencia: "Transferência Bancária",
      dinheiro: "Dinheiro",
      cartao: "Cartão no local",
    };

    const itemsText = cart
      .map(
        (item) =>
          `• ${item.title} — ${item.quantity}x — €${item.price * item.quantity}`
      )
      .join("\n");

    const message = `Olá, gostaria de pedir um orçamento para os seguintes serviços:

SERVIÇOS:
${itemsText}

Subtotal: €${subtotal}
Taxa de deslocação: €${travelFee}
Total estimado: €${total}

DADOS DO CLIENTE:
Nome: ${customerName}
Telefone: ${customerPhone}
Morada: ${customerAddress}
Código Postal: ${customerPostalCode}
Localização no Maps: ${mapsLink || "Não informada"}
Data pretendida: ${selectedDate}
Hora pretendida: ${selectedTime}
Forma de pagamento: ${paymentLabels[paymentMethod] || paymentMethod}
Observações: ${customerNotes || "Sem observações"}

Aguardo confirmação.`;

    const whatsappUrl = `https://wa.me/351911132401?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        html { scroll-behavior: smooth; }
        body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        h1,h2,h3,h4,h5,h6 { font-family: Oswald, Inter, sans-serif; }
        .electric-glow { text-shadow: 0 0 16px rgba(250, 204, 21, 0.35), 0 0 36px rgba(250, 204, 21, 0.12); }
      `}</style>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-left"
          >
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-zinc-400 transition hover:text-yellow-400"
              >
                {item.label}
              </button>
            ))}

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
                  onClick={() => {
                    scrollToSection(item.id);
                    setMenuOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left text-zinc-300 transition hover:bg-zinc-900 hover:text-yellow-400"
                >
                  {item.label}
                </button>
              ))}

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

      <main>
        <section
          id="hero"
          className="relative flex min-h-screen items-center overflow-hidden pt-20"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(250,204,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.18) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_30%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-24">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300"
              >
                <Zap className="h-4 w-4" />
                Grande Lisboa • Atendimento profissional
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mb-6"
              >
                <img
                  src={logo}
                  alt="Obelisco Radical Eletricidade"
                  className="h-20 w-auto object-contain mix-blend-lighten sm:h-24"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="electric-glow text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Serviços elétricos profissionais{" "}
                <span className="block text-yellow-400">
                  com segurança e rapidez
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl"
              >
                Instalações, reparações e manutenção elétrica para residências,
                comércios e empresas na Grande Lisboa. Atendimento profissional,
                execução segura e resposta rápida.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-9 flex flex-col gap-4 sm:flex-row"
              >
                <a
                  href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
                  className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-4 text-base font-semibold uppercase tracking-wide text-zinc-950 transition hover:bg-yellow-300"
                >
                  Pedir orçamento no WhatsApp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>

                <button
                  onClick={() => scrollToSection("services")}
                  className="rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-base font-medium text-white transition hover:bg-zinc-800"
                >
                  Ver serviços
                </button>
              </motion.div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <a
                  href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-yellow-500/40 hover:bg-zinc-900"
                >
                  <div className="text-sm text-zinc-400">📱 WhatsApp</div>
                  <div className="mt-1 text-2xl font-black text-yellow-400">
                    911 132 401
                  </div>
                </a>

                <a
                  href="mailto:obeliscoradical@gmail.com"
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-yellow-500/40 hover:bg-zinc-900"
                >
                  <div className="text-sm text-zinc-400">📧 Email</div>
                  <div className="mt-1 text-base font-bold text-yellow-400 break-all">
                    obeliscoradical@gmail.com
                  </div>
                </a>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="text-sm text-zinc-400">📍 Área de atendimento</div>
                  <div className="mt-1 text-2xl font-black text-yellow-400">
                    Grande Lisboa
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 shadow-2xl shadow-yellow-500/10">
                <div className="mb-8 flex items-center gap-4">
                  <img
                    src={logo}
                    alt="Obelisco Radical Eletricidade"
                    className="h-20 w-auto rounded-xl object-contain mix-blend-lighten"
                  />
                  <div>
                    <div className="text-3xl font-black">Obelisco Radical</div>
                    <div className="text-sm uppercase tracking-[0.35em] text-zinc-400">
                      Eletricidade
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      Icon: ShieldCheck,
                      title: "Execução segura e profissional",
                      text: "Serviços elétricos realizados com atenção aos detalhes e total segurança.",
                    },
                    {
                      Icon: Wrench,
                      title: "Soluções para casas e empresas",
                      text: "Instalações, reparações e manutenção elétrica para residências e espaços comerciais.",
                    },
                    {
                      Icon: MessageCircle,
                      title: "Atendimento rápido",
                      text: "Orçamentos e suporte direto pelo WhatsApp.",
                    },
                  ].map(({ Icon, title, text }, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4 text-zinc-300"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-yellow-400" />
                        <span className="font-semibold text-white">{title}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

        <section
          id="services"
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mb-14 flex flex-col items-start justify-between gap-6 text-left md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Serviços <span className="text-yellow-400">Elétricos</span>
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Conheça os principais serviços que realizamos para residências,
                comércios e empresas na Grande Lisboa.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300">
                📍 Taxa de deslocação: €35
              </div>
            </div>

            <a
              href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
              className="inline-flex items-center rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-medium text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              Falar no WhatsApp
              <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-7 transition duration-300 hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(250,204,21,0.08)]">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="text-2xl font-bold uppercase tracking-wide text-white">
                      {service.title}
                    </h3>

                    <p className="mt-3 flex-1 leading-7 text-zinc-400">
                      {service.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-lg font-bold text-yellow-300">
                        Desde €{service.price}
                      </span>

                      <button
                        onClick={() => addToCart(service)}
                        className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
                      >
                        Pedir este serviço
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section
          id="vantagens"
          className="bg-zinc-900/50 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Porque escolher a{" "}
                <span className="text-yellow-400">Obelisco Radical</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Compromisso com qualidade, segurança e atendimento profissional
                em cada serviço realizado.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item, i) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 leading-7 text-zinc-400">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {sectors.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      {item.title}
                    </div>
                    <div className="mt-2 text-zinc-400">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7"
              >
                <div className="mb-4 flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="leading-7 text-zinc-300">"{item.text}"</p>
                <div className="mt-5 font-semibold text-white">{item.name}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="border-y border-zinc-800 bg-zinc-900/40 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Perguntas <span className="text-yellow-400">frequentes</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((item) => (
                <div
                  key={item.q}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <h3 className="text-xl font-bold text-white">{item.q}</h3>
                  <p className="mt-3 leading-7 text-zinc-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-yellow-500/10 md:p-12">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                  Pronto para pedir{" "}
                  <span className="text-yellow-400">o seu orçamento?</span>
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                  Entre em contacto e receba atendimento rápido da Obelisco
                  Radical para instalações, reparações e manutenção elétrica na
                  Grande Lisboa.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
                    className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                  >
                    WhatsApp: 911 132 401
                  </a>

                  <button
                    onClick={() => openBooking()}
                    className="rounded-2xl border border-zinc-700 px-6 py-4 font-medium text-white transition hover:border-yellow-400 hover:text-yellow-300"
                  >
                    Agendar atendimento
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    Icon: Phone,
                    label: "Telefone / WhatsApp",
                    value: "+351 911 132 401",
                  },
                  {
                    Icon: Mail,
                    label: "Email",
                    value: "obeliscoradical@gmail.com",
                  },
                  {
                    Icon: MapPin,
                    label: "Zona de atuação",
                    value: "Grande Lisboa",
                  },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-sm text-zinc-400">{label}</div>
                      <div className="font-semibold text-white">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>© {new Date().getFullYear()} Obelisco Radical Eletricidade</span>
          </div>

          <div className="text-center sm:text-right">
            <div>Instagram: @obeliscoradical</div>
            <div>www.obeliscoradical.pt</div>
          </div>
        </div>
      </footer>

      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-5 z-40 inline-flex items-center rounded-full bg-yellow-400 px-5 py-4 font-semibold text-zinc-950 shadow-2xl transition hover:bg-yellow-300"
      >
        Carrinho ({cartCount})
      </button>

      <a
        href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento."
        className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full bg-green-500 px-5 py-4 font-semibold text-white shadow-2xl shadow-green-500/20 transition hover:bg-green-400"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        WhatsApp
      </a>

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="grid h-full w-full lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-full overflow-y-auto bg-zinc-950 px-4 py-6 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                        Pedir <span className="text-yellow-400">orçamento</span>
                      </h2>
                      <p className="mt-2 text-zinc-400">
                        Preencha os seus dados para enviar o pedido diretamente
                        no WhatsApp.
                      </p>
                    </div>

                    <button
                      onClick={() => setCartOpen(false)}
                      className="rounded-2xl border border-zinc-800 p-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-zinc-950">
                          1
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            Dados
                          </div>
                          <div className="text-xs text-zinc-400">Cliente</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-zinc-950">
                          2
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            Agendamento
                          </div>
                          <div className="text-xs text-zinc-400">
                            Data e hora
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-zinc-950">
                          3
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            Pagamento
                          </div>
                          <div className="text-xs text-zinc-400">
                            Finalização
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <h3 className="text-2xl font-bold text-white">
                      O carrinho está vazio
                    </h3>
                    <p className="mt-3 text-zinc-400">
                      Selecione pelo menos um serviço para continuar.
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-6 rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                    >
                      Voltar aos serviços
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 pb-10">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                      <h3 className="mb-5 text-xl font-bold text-white">
                        Dados do cliente
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nome completo"
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        />

                        <input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Telefone / WhatsApp"
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Morada"
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        />

                        <input
                          value={customerPostalCode}
                          onChange={(e) => setCustomerPostalCode(e.target.value)}
                          placeholder="Código postal"
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        />
                      </div>

                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Observações sobre o serviço"
                        rows={4}
                        className="mt-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                      />
                    </div>

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                      <h3 className="mb-5 text-xl font-bold text-white">
                        Agendamento
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        />

                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                        >
                          <option value="">Escolher hora</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                      <h3 className="mb-5 text-xl font-bold text-white">
                        Forma de pagamento
                      </h3>

                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                      >
                        <option value="">Selecione a forma de pagamento</option>
                        <option value="mbway">MB Way</option>
                        <option value="transferencia">
                          Transferência Bancária
                        </option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão no local</option>
                      </select>
                    </div>

                    <div className="lg:hidden">
                      <button
                        onClick={handleCheckoutWhatsApp}
                        disabled={
                          cart.length === 0 ||
                          !customerName ||
                          !customerPhone ||
                          !customerAddress ||
                          !selectedDate ||
                          !selectedTime ||
                          !paymentMethod
                        }
                        className="w-full rounded-2xl bg-yellow-400 px-5 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Finalizar no WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-full border-l border-zinc-800 bg-zinc-900 lg:block">
              <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-8 py-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white">
                    Resumo do pedido
                  </h3>
                  <p className="mt-2 text-zinc-400">
                    Revise os serviços antes de enviar.
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Desde €{item.price}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-red-400 transition hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="text-lg text-white"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQty(item.id)}
                            className="text-lg text-white"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-lg font-bold text-yellow-300">
                          €{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="text-white">€{subtotal}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Taxa de deslocação</span>
                      <span className="text-white">€{travelFee}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                      <span className="text-lg font-semibold text-zinc-300">
                        Total estimado
                      </span>
                      <span className="text-2xl font-black text-yellow-300">
                        €{total}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutWhatsApp}
                    disabled={
                      cart.length === 0 ||
                      !customerName ||
                      !customerPhone ||
                      !customerAddress ||
                      !selectedDate ||
                      !selectedTime ||
                      !paymentMethod
                    }
                    className="mt-6 w-full rounded-2xl bg-yellow-400 px-5 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Finalizar no WhatsApp
                  </button>

                  <p className="mt-4 text-sm leading-6 text-zinc-500">
                    Ao finalizar, será aberta uma mensagem no WhatsApp com os
                    dados do pedido para confirmação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={selectedService}
      />

      <ElectricalAssistant />
    </div>
  );
}