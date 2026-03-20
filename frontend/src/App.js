import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { startCheckout } from "@easypaypt/checkout-sdk";
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
  Loader2,
  CreditCard,
  Smartphone,
  Landmark,
} from "lucide-react";

// Logo URL
const logoUrl = "https://customer-assets.emergentagent.com/job_5fce1f4d-80cf-4626-b6e9-65e04d47c472/artifacts/h167wiyk_Captura%20de%20Tela%202026-03-12%20a%CC%80s%2021.48.12.png";

// API URLs
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const ORDERS_API = "https://tech-app-obelisco.emergent.host/api";

const services = [
  {
    id: "instalacao",
    title: "Instalacoes Eletricas",
    description:
      "Instalacoes eletricas completas para casas, apartamentos e empresas. Execucao profissional com seguranca e acabamento de qualidade.",
    icon: Plug,
    price: 50,
  },
  {
    id: "iluminacao",
    title: "Iluminacao Interior e Exterior",
    description:
      "Projetos de iluminacao funcional e decorativa com solucoes LED. Mais eficiencia, melhor estetica e instalacao segura.",
    icon: Lightbulb,
    price: 27.5,
  },
  {
    id: "manutencao",
    title: "Manutencao e Reparacao",
    description:
      "Diagnostico e reparacao de falhas eletricas. Solucoes rapidas para restaurar o funcionamento com seguranca.",
    icon: Wrench,
    price: 37,
  },
  {
    id: "quadro",
    title: "Quadros Eletricos",
    description:
      "Instalacao, substituicao e organizacao de quadros eletricos. Mais seguranca e melhor protecao para a instalacao eletrica.",
    icon: CircuitBoard,
    price: 150,
  },
  {
    id: "cablagem",
    title: "Cablagem Estruturada",
    description:
      "Infraestrutura para energia, dados e telecomunicacoes. Solucoes organizadas para ambientes residenciais e empresariais.",
    icon: Cable,
    price: 95,
  },
  {
    id: "seguranca",
    title: "Seguranca e Inspecao",
    description:
      "Avaliacao tecnica e melhorias de seguranca na instalacao eletrica. Reducao de riscos com acompanhamento profissional.",
    icon: ShieldCheck,
    price: 110,
  },
];

const highlights = [
  {
    icon: Clock3,
    title: "Resposta rapida",
    text: "Atendimento agil para pedidos de orcamento e intervencoes tecnicas.",
  },
  {
    icon: ShieldCheck,
    title: "Seguranca em primeiro lugar",
    text: "Execucao focada em qualidade tecnica, protecao e confianca para o cliente.",
  },
  {
    icon: Award,
    title: "Servico profissional",
    text: "Compromisso com qualidade, organizacao e atencao aos detalhes em cada atendimento.",
  },
];

const sectors = [
  {
    icon: Home,
    title: "Residencial",
    text: "Casas, apartamentos e condominios.",
  },
  {
    icon: Building2,
    title: "Comercial",
    text: "Lojas, restaurantes, clinicas e escritorios.",
  },
  {
    icon: Zap,
    title: "Empresarial",
    text: "Projetos com foco em desempenho e fiabilidade.",
  },
];

const testimonials = [
  {
    name: "Cliente Residencial - Odivelas",
    text: "Atendimento rapido, trabalho limpo e excelente comunicacao. Passa muita confianca.",
  },
  {
    name: "Cliente Comercial - Lisboa",
    text: "Servico profissional do inicio ao fim. Resolveram tudo com rapidez e organizacao.",
  },
  {
    name: "Cliente Empresarial - Loures",
    text: "Precisavamos de resposta rapida e tivemos exatamente isso. Recomendo pela seriedade.",
  },
];

const faqs = [
  {
    q: "Atendem Lisboa e Cascais?",
    a: "Sim. A Obelisco Radical atua em Lisboa, Cascais e zonas proximas, mediante avaliacao do servico.",
  },
  {
    q: "Fazem orcamento rapido?",
    a: "Sim. O contacto pode ser feito por telefone, WhatsApp ou email para uma resposta inicial rapida.",
  },
  {
    q: "Trabalham com clientes residenciais e empresas?",
    a: "Sim. Atendemos moradias, apartamentos, comercios, escritorios e clientes empresariais.",
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

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoUrl}
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

  useEffect(() => {
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
                {submitted ? "Pedido Confirmado" : "Pedir Orcamento"}
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
                dia <span className="font-semibold text-white">{date}</span> as{" "}
                <span className="font-semibold text-white">{time}</span>.
                Entraremos em contacto o mais rapido possivel.
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
                    Selecione o servico desejado:
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
                            Desde EUR{s.price}
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
                      Horario
                    </label>

                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    >
                      <option value="">Selecione o horario</option>
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
                      placeholder="Morada do servico"
                      className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                    />
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Descreva o servico pretendido"
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
                    Proximo
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

// Easypay Checkout Component
function EasypayCheckoutModal({ open, onClose, orderData, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutInstance, setCheckoutInstance] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Reset when modal closes
    if (!open) {
      setInitialized(false);
      setError(null);
      if (checkoutInstance) {
        try {
          checkoutInstance.unmount();
        } catch (e) {
          console.log("Unmount error:", e);
        }
        setCheckoutInstance(null);
      }
    }
  }, [open, checkoutInstance]);

  useEffect(() => {
    if (!open || !orderData || orderData.value <= 0 || initialized) return;

    const initializeCheckout = async () => {
      setLoading(true);
      setError(null);
      setInitialized(true);

      try {
        // Create checkout session on backend
        const response = await fetch(`${BACKEND_URL}/api/checkout/create-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: orderData.value,
            currency: "EUR",
            items: orderData.items,
            customer: {
              name: orderData.customer.name,
              email: orderData.customer.email,
              phone: orderData.customer.phone,
            },
            payment_methods: ["cc", "mbw", "mb"],
            order_id: orderData.orderId,
          }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.detail || "Failed to create checkout session");
        }

        console.log("Checkout session created:", responseData);

        // Initialize Easypay checkout form
        const instance = startCheckout(responseData.session, {
          display: "inline",
          id: "easypay-checkout-container",
          language: "pt",

          onSuccess: (checkoutInfo) => {
            console.log("Payment successful:", checkoutInfo);
            onPaymentSuccess({
              paymentId: checkoutInfo?.id || responseData.payment_id,
              status: "success",
              method: checkoutInfo?.method,
              amount: orderData.value,
            });
          },

          onError: (err) => {
            console.error("Checkout error:", err);
            setError(`Erro no pagamento: ${err?.message || "Tente novamente"}`);
          },

          onPaymentError: (err) => {
            console.warn("Recoverable payment error:", err);
            if (err?.code === "checkout-expired") {
              setError("Sessao expirada. Por favor, feche e tente novamente.");
            }
          },

          onClose: () => {
            console.log("Checkout closed by user");
          },

          // Customization
          logoUrl: logoUrl,
          accentColor: "#FACC15",
          backgroundColor: "#18181B",
          buttonBackgroundColor: "#FACC15",
          buttonBorderRadius: 16,
          inputBorderRadius: 16,
          inputBorderColor: "#3F3F46",
          inputBackgroundColor: "#27272A",
          inputColor: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        });

        setCheckoutInstance(instance);
      } catch (err) {
        console.error("Checkout initialization failed:", err);
        // Show user-friendly error message
        setError("O sistema de pagamento está temporariamente indisponível. Por favor contacte-nos via WhatsApp para finalizar o seu pedido.");
        // Don't reset initialized to prevent infinite loops
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [open, orderData, initialized, onPaymentSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wide text-white">
                Pagamento Seguro
              </h3>
              <p className="text-sm text-zinc-400">
                Powered by Easypay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h4 className="mb-3 font-semibold text-white">Resumo do Pedido</h4>
            {orderData?.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-zinc-400">
                <span>{item.description} x{item.quantity}</span>
                <span>EUR{(item.value * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-zinc-800 pt-3">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-yellow-400">
                EUR{orderData?.value?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="mb-6 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <CreditCard className="h-5 w-5" />
              <span>Cartao</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Smartphone className="h-5 w-5" />
              <span>MB Way</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Landmark className="h-5 w-5" />
              <span>Multibanco</span>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
              <p className="mt-4 text-zinc-400">A iniciar pagamento seguro...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-red-300">{error}</p>
              <p className="mt-2 text-sm text-zinc-400">
                O sistema de pagamento não está disponível de momento. Por favor, entre em contacto via WhatsApp para finalizar o seu pedido.
              </p>
              <button
                onClick={onClose}
                className="mt-3 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Easypay Checkout Container */}
          {!error && (
            <div
              id="easypay-checkout-container"
              className="min-h-[400px] rounded-2xl"
              style={{
                display: loading ? "none" : "block",
              }}
            />
          )}

          <p className="mt-4 text-center text-xs text-zinc-500">
            Pagamento processado de forma segura pela Easypay. Os seus dados estao protegidos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Payment states
  const [checkoutStep, setCheckoutStep] = useState("form"); // form, payment, success
  const [showEasypayCheckout, setShowEasypayCheckout] = useState(false);
  const [easypayOrderData, setEasypayOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const nav = [
    { label: "Inicio", id: "hero" },
    { label: "Servicos", id: "services" },
    { label: "Vantagens", id: "vantagens" },
    { label: "FAQ", id: "faq" },
    { label: "Contacto", id: "contact" },
  ];

  const openBooking = (serviceId) => {
    setSelectedService(serviceId);
    setBookingOpen(true);
  };

  const addToCart = (service) => {
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

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const travelFee = cart.length > 0 ? 35 : 0;
  const total = subtotal + travelFee;

  const resetCheckout = () => {
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerPostalCode("");
    setCustomerNotes("");
    setSelectedDate("");
    setSelectedTime("");
    setCheckoutStep("form");
    setShowEasypayCheckout(false);
    setEasypayOrderData(null);
    setSubmitError("");
    setCartOpen(false);
  };

  // Proceed to payment
  const handleProceedToPayment = async () => {
    const normalizedCustomerPhone = customerPhone.replace(/\s+/g, "");

    if (
      cart.length === 0 ||
      !customerName ||
      !customerEmail ||
      normalizedCustomerPhone.length < 9 ||
      !customerAddress ||
      !selectedDate ||
      !selectedTime
    ) {
      setSubmitError("Por favor, preencha todos os campos obrigatorios.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Prepare order data for Easypay
      const orderData = {
        value: total,
        orderId: orderId,
        items: [
          ...cart.map((item) => ({
            description: item.title,
            quantity: item.quantity,
            value: item.price * item.quantity,
          })),
          {
            description: "Taxa de deslocacao",
            quantity: 1,
            value: travelFee,
          },
        ],
        customer: {
          name: customerName,
          email: customerEmail,
          phone: normalizedCustomerPhone,
        },
        metadata: {
          address: customerAddress,
          postalCode: customerPostalCode,
          notes: customerNotes,
          date: selectedDate,
          time: selectedTime,
        },
      };

      setEasypayOrderData(orderData);
      setShowEasypayCheckout(true);
    } catch (error) {
      console.error("Error preparing payment:", error);
      setSubmitError("Erro ao preparar pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentData) => {
    console.log("Payment success:", paymentData);
    setShowEasypayCheckout(false);

    // Send order to management app
    try {
      const servicesDescription = cart
        .map((item) => `${item.title} (${item.quantity}x) - EUR${item.price * item.quantity}`)
        .join("\n");

      const fullDescription = `SERVICOS SOLICITADOS:
${servicesDescription}

Subtotal: EUR${subtotal}
Taxa de deslocacao: EUR${travelFee}
Total: EUR${total}

PAGAMENTO CONFIRMADO via Easypay
ID Pagamento: ${paymentData.paymentId}
Metodo: ${paymentData.method || "Online"}

Codigo Postal: ${customerPostalCode || "Nao informado"}
Horario preferido: ${selectedTime}
Observacoes: ${customerNotes || "Sem observacoes"}`;

      const mainServiceType = cart.length > 0 ? cart[0].id : "manutencao";

      await fetch(`${ORDERS_API}/orders/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: customerName,
          email: customerEmail,
          phone: customerPhone.replace(/\s+/g, ""),
          address: customerAddress,
          service_type: mainServiceType,
          preferred_date: selectedDate,
          description: fullDescription,
        }),
      });
    } catch (error) {
      console.error("Error sending to management app:", error);
    }

    setCheckoutStep("success");
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
            data-testid="logo-btn"
          >
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-zinc-400 transition hover:text-yellow-400"
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}

            <a
              href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
              data-testid="whatsapp-header-btn"
            >
              WhatsApp direto
            </a>
          </nav>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-300 md:hidden"
            data-testid="mobile-menu-btn"
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
                href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
                className="block w-full rounded-2xl bg-yellow-400 px-5 py-3 text-center font-semibold text-zinc-950"
              >
                WhatsApp direto
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
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
                Grande Lisboa - Atendimento profissional
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mb-6"
              >
                <img
                  src={logoUrl}
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
                Servicos eletricos profissionais{" "}
                <span className="block text-yellow-400">
                  com seguranca e rapidez
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl"
              >
                Instalacoes, reparacoes e manutencao eletrica para residencias,
                comercios e empresas na Grande Lisboa. Atendimento profissional,
                execucao segura e resposta rapida.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-9 flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={() => scrollToSection("services")}
                  className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-4 text-base font-semibold uppercase tracking-wide text-zinc-950 transition hover:bg-yellow-300"
                  data-testid="hero-services-btn"
                >
                  Ver servicos e Pagar Online
                  <CreditCard className="ml-2 h-4 w-4" />
                </button>

                <a
                  href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
                  className="rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-base font-medium text-white transition hover:bg-zinc-800"
                >
                  WhatsApp
                </a>
              </motion.div>

              {/* Payment Methods Badge */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3"
              >
                <span className="text-sm font-medium text-green-300">Pagamento Online:</span>
                <div className="flex items-center gap-3 text-zinc-400">
                  <CreditCard className="h-5 w-5" />
                  <Smartphone className="h-5 w-5" />
                  <Landmark className="h-5 w-5" />
                </div>
                <span className="text-xs text-zinc-500">Cartao | MB Way | Multibanco</span>
              </motion.div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <a
                  href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-yellow-500/40 hover:bg-zinc-900"
                >
                  <div className="text-sm text-zinc-400">WhatsApp</div>
                  <div className="mt-1 text-2xl font-black text-yellow-400">
                    911 132 401
                  </div>
                </a>

                <a
                  href="mailto:obeliscoradical@gmail.com"
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-yellow-500/40 hover:bg-zinc-900"
                >
                  <div className="text-sm text-zinc-400">Email</div>
                  <div className="mt-1 text-base font-bold text-yellow-400 break-all">
                    obeliscoradical@gmail.com
                  </div>
                </a>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="text-sm text-zinc-400">Area de atendimento</div>
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
                    src={logoUrl}
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
                      Icon: CreditCard,
                      title: "Pagamento Online Seguro",
                      text: "Pague com Cartao, MB Way ou Multibanco diretamente no site.",
                    },
                    {
                      Icon: ShieldCheck,
                      title: "Execucao segura e profissional",
                      text: "Servicos eletricos realizados com atencao aos detalhes.",
                    },
                    {
                      Icon: MessageCircle,
                      title: "Atendimento rapido",
                      text: "Orcamentos e suporte direto pelo WhatsApp.",
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

        {/* Services Section */}
        <section
          id="services"
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mb-14 flex flex-col items-start justify-between gap-6 text-left md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Servicos <span className="text-yellow-400">Eletricos</span>
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Conheca os principais servicos que realizamos para residencias,
                comercios e empresas na Grande Lisboa.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300">
                  Taxa de deslocacao: EUR35
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300">
                  <CreditCard className="h-4 w-4" />
                  Pagamento Online Disponivel
                </div>
              </div>
            </div>
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
                        Desde EUR{service.price}
                      </span>

                      <button
                        onClick={() => addToCart(service)}
                        className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
                        data-testid={`add-service-${service.id}`}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Vantagens Section */}
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
                Compromisso com qualidade, seguranca e atendimento profissional
                em cada servico realizado.
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

        {/* Testimonials */}
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

        {/* FAQ */}
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

        {/* Contact */}
        <section
          id="contact"
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-yellow-500/10 md:p-12">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                  Pronto para pedir{" "}
                  <span className="text-yellow-400">o seu orcamento?</span>
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                  Entre em contacto e receba atendimento rapido da Obelisco
                  Radical para instalacoes, reparacoes e manutencao eletrica na
                  Grande Lisboa.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={() => scrollToSection("services")}
                    className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pedir e Pagar Online
                  </button>

                  <a
                    href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
                    className="rounded-2xl border border-zinc-700 px-6 py-4 font-medium text-white transition hover:border-yellow-400 hover:text-yellow-300"
                  >
                    WhatsApp: 911 132 401
                  </a>
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
                    label: "Zona de atuacao",
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
            <span>2025 Obelisco Radical Eletricidade</span>
          </div>

          <div className="text-center sm:text-right">
            <div>Instagram: @obeliscoradical</div>
            <div>www.obeliscoradical.pt</div>
          </div>
        </div>
      </footer>

      {/* Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-5 z-40 inline-flex items-center rounded-full bg-yellow-400 px-5 py-4 font-semibold text-zinc-950 shadow-2xl transition hover:bg-yellow-300"
        data-testid="cart-btn"
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Carrinho ({cartCount})
      </button>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/351911132401?text=Ola,%20gostaria%20de%20pedir%20um%20orcamento."
        className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full bg-green-500 px-5 py-4 font-semibold text-white shadow-2xl shadow-green-500/20 transition hover:bg-green-400"
        data-testid="whatsapp-float-btn"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        WhatsApp
      </a>

      {/* Cart/Checkout Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="grid h-full w-full lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-full overflow-y-auto bg-zinc-950 px-4 py-6 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-3xl">
                {checkoutStep === "success" ? (
                  // Success Screen
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle2 className="h-14 w-14 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white">Pagamento Confirmado!</h2>
                    <p className="mt-4 max-w-md text-zinc-400">
                      O seu pagamento foi processado com sucesso. Entraremos em contacto para confirmar o agendamento.
                    </p>
                    <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-400/10 px-6 py-3 text-yellow-300">
                      WhatsApp: +351 911 132 401
                    </div>
                    <button
                      onClick={resetCheckout}
                      className="mt-8 rounded-2xl bg-yellow-400 px-8 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                      data-testid="close-success-btn"
                    >
                      Fechar
                    </button>
                  </div>
                ) : (
                  // Checkout Form
                  <>
                    <div className="mb-8">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                            Checkout <span className="text-yellow-400">Seguro</span>
                          </h2>
                          <p className="mt-2 text-zinc-400">
                            Preencha os dados e pague online.
                          </p>
                        </div>

                        <button
                          onClick={() => setCartOpen(false)}
                          className="rounded-2xl border border-zinc-800 p-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                          data-testid="close-cart-btn"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Payment Methods Badge */}
                      <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-4">
                        <div className="flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2 text-sm text-green-300">
                            <CreditCard className="h-5 w-5" />
                            <span>Cartao</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-300">
                            <Smartphone className="h-5 w-5" />
                            <span>MB Way</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-300">
                            <Landmark className="h-5 w-5" />
                            <span>Multibanco</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {cart.length === 0 ? (
                      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                        <h3 className="text-2xl font-bold text-white">
                          O carrinho esta vazio
                        </h3>
                        <p className="mt-3 text-zinc-400">
                          Selecione pelo menos um servico para continuar.
                        </p>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="mt-6 rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                        >
                          Voltar aos servicos
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8 pb-10">
                        {submitError && (
                          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                            {submitError}
                          </div>
                        )}

                        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                          <h3 className="mb-5 text-xl font-bold text-white">
                            Dados do cliente
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <input
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Nome completo *"
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="customer-name-input"
                            />

                            <input
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="Email *"
                              type="email"
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="customer-email-input"
                            />
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <input
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Telefone / WhatsApp *"
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="customer-phone-input"
                            />

                            <input
                              value={customerPostalCode}
                              onChange={(e) => setCustomerPostalCode(e.target.value)}
                              placeholder="Codigo postal"
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="customer-postal-input"
                            />
                          </div>

                          <input
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Morada completa *"
                            className="mt-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                            data-testid="customer-address-input"
                          />

                          <textarea
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="Observacoes sobre o servico"
                            rows={3}
                            className="mt-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                            data-testid="customer-notes-input"
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
                              data-testid="date-input"
                            />

                            <select
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="time-select"
                            >
                              <option value="">Escolher hora *</option>
                              {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="lg:hidden">
                          <button
                            onClick={handleProceedToPayment}
                            disabled={isSubmitting || cart.length === 0}
                            className="w-full rounded-2xl bg-green-500 px-5 py-4 font-semibold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="checkout-mobile-btn"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Preparando...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pagar EUR{total.toFixed(2)}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {checkoutStep !== "success" && cart.length > 0 && (
              <div className="hidden h-full border-l border-zinc-800 bg-zinc-900 lg:block">
                <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-8 py-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white">
                      Resumo do pedido
                    </h3>
                    <p className="mt-2 text-zinc-400">
                      Revise os servicos antes de pagar.
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
                              Desde EUR{item.price}
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
                            EUR{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="text-white">EUR{subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Taxa de deslocacao</span>
                        <span className="text-white">EUR{travelFee.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                        <span className="text-lg font-semibold text-zinc-300">
                          Total
                        </span>
                        <span className="text-2xl font-black text-yellow-300">
                          EUR{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      disabled={isSubmitting || cart.length === 0}
                      className="mt-6 w-full rounded-2xl bg-green-500 px-5 py-4 font-semibold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="checkout-btn"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Preparando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Pagar com Cartao / MB Way / Multibanco
                        </span>
                      )}
                    </button>

                    <p className="mt-4 text-center text-xs text-zinc-500">
                      Pagamento seguro processado pela Easypay
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Easypay Checkout Modal */}
      <EasypayCheckoutModal
        open={showEasypayCheckout}
        onClose={() => setShowEasypayCheckout(false)}
        orderData={easypayOrderData}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={selectedService}
      />

      <ElectricalAssistant />
    </div>
  );
}
