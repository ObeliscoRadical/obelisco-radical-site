import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import ElectricalAssistant from "./components/ElectricalAssistant";
import PWAInstallBanner from "./components/PWAInstallBanner";
import HeroCarousel from "./components/HeroCarousel";
import ConnectLogin from "./pages/ConnectLogin";
import ConnectClientDashboard from "./pages/ConnectClientDashboard";
import ConnectTechDashboard from "./pages/ConnectTechDashboard";
import ConnectAdminDashboard from "./pages/ConnectAdminDashboard";
import InsightArticle from "./pages/InsightArticle";
import { trackPageView } from "./utils/analytics";
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
  Sun,
  Car,
  AlertTriangle,
  Check,
  FileText,
  Headphones,
  Shield,
  Users,
} from "lucide-react";

// Logo URL
const logoUrl = "https://customer-assets.emergentagent.com/job_5fce1f4d-80cf-4626-b6e9-65e04d47c472/artifacts/h167wiyk_Captura%20de%20Tela%202026-03-12%20a%CC%80s%2021.48.12.png";

// API URLs
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const ORDERS_API = "https://tech-app-obelisco.emergent.host/api";

const services = [
  // === SERVIÇOS PRINCIPAIS ===
  {
    id: "instalacao",
    title: "Instalacao Eletrica Completa",
    description:
      "Instalacoes eletricas para casas, apartamentos e escritorios. Inclui quadro, cablagem e pontos de luz/tomadas. Trabalho certificado.",
    icon: Plug,
    price: 45,
    priceNote: "por ponto",
  },
  {
    id: "quadro",
    title: "Quadro Eletrico",
    description:
      "Instalacao, substituicao ou modernizacao de quadros eletricos monofasicos ou trifasicos. Disjuntores e protecao diferencial incluidos.",
    icon: CircuitBoard,
    price: 280,
    priceNote: "a partir de",
  },
  {
    id: "manutencao",
    title: "Reparacao e Diagnostico",
    description:
      "Identificacao e reparacao de avarias eletricas: curto-circuitos, falhas de energia, tomadas danificadas. Resposta rapida.",
    icon: Wrench,
    price: 40,
    priceNote: "por hora",
  },
  {
    id: "iluminacao",
    title: "Iluminacao LED",
    description:
      "Instalacao de candeeiros, focos embutidos, fitas LED e projectores. Solucoes modernas para poupar energia.",
    icon: Lightbulb,
    price: 25,
    priceNote: "por ponto",
  },
  // === SERVIÇOS RESIDENCIAIS ===
  {
    id: "tomadas",
    title: "Tomadas e Interruptores",
    description:
      "Instalacao ou substituicao de tomadas, interruptores simples, duplos ou com regulador de intensidade.",
    icon: Plug,
    price: 20,
    priceNote: "por unidade",
  },
  {
    id: "certificacao",
    title: "Certificacao DGEG",
    description:
      "Emissao de certificado de conformidade da instalacao eletrica. Obrigatorio para alteracao de potencia ou venda de imovel.",
    icon: Award,
    price: 150,
    priceNote: "a partir de",
  },
  {
    id: "potencia",
    title: "Aumento de Potencia",
    description:
      "Avaliacao e preparacao da instalacao para aumento de potencia contratada. Inclui visita tecnica e documentacao.",
    icon: Zap,
    price: 180,
    priceNote: "a partir de",
  },
  // === SERVIÇOS ESPECIALIZADOS ===
  {
    id: "carregador",
    title: "Carregador Veiculo Eletrico",
    description:
      "Instalacao de wallbox para carregamento de carro eletrico em casa ou condominio. Compativel com todas as marcas.",
    icon: Car,
    price: 350,
    priceNote: "a partir de",
  },
  {
    id: "domotica",
    title: "Domotica e Automacao",
    description:
      "Instalacao de sistemas de automacao residencial: iluminacao inteligente, estores automaticos, controlo por app.",
    icon: Home,
    price: 75,
    priceNote: "por dispositivo",
  },
  {
    id: "paineis",
    title: "Paineis Solares",
    description:
      "Consultoria e instalacao de sistemas fotovoltaicos para autoconsumo. Reduza a sua fatura de eletricidade.",
    icon: Sun,
    price: 500,
    priceNote: "consulta + projeto",
  },
  // === SERVIÇOS COMERCIAIS ===
  {
    id: "cablagem",
    title: "Cablagem Estruturada",
    description:
      "Infraestrutura de rede para escritorios e lojas. Cabos de dados, fibra otica e organizacao de bastidores.",
    icon: Cable,
    price: 85,
    priceNote: "por ponto",
  },
  {
    id: "urgencia",
    title: "Servico de Urgencia",
    description:
      "Atendimento prioritario para emergencias eletricas fora do horario normal. Disponivel noites e fins de semana.",
    icon: AlertTriangle,
    price: 75,
    priceNote: "por hora",
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
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
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

// Stripe Payment Modal Component - Stripe Only
function PaymentMethodModal({ open, onClose, orderData, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  // Check for payment success on URL params (Stripe redirect back)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const sessionId = urlParams.get('session_id');
    
    if (paymentSuccess === 'true' && sessionId) {
      // Verify payment status
      fetch(`${BACKEND_URL}/api/stripe/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.payment_status === 'paid') {
            onPaymentSuccess({
              sessionId: sessionId,
              status: 'success',
              method: 'card',
              amount: data.amount
            });
          }
        })
        .catch(err => console.error('Error verifying payment:', err));
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onPaymentSuccess]);

  const handlePayWithStripe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.value,
          currency: "EUR",
          items: orderData.items,
          customer: {
            name: orderData.customer.name,
            email: orderData.customer.email,
            phone: orderData.customer.phone,
          },
          origin_url: window.location.origin,
          order_id: orderData.orderId,
          metadata: orderData.metadata
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Erro ao criar sessão de pagamento");
      }

      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("URL de checkout não recebida");
      }

    } catch (err) {
      console.error("Payment error:", err);
      setError("Erro ao processar pagamento. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Pagamento Seguro</h2>
            <p className="text-sm text-zinc-400">Pague com cartão de crédito ou débito</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Total a pagar</p>
          <p className="text-2xl font-bold text-yellow-400">EUR{orderData?.value?.toFixed(2)}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            <p className="mt-2 text-zinc-400">A redirecionar para pagamento seguro...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stripe Payment Button */}
            <button
              onClick={handlePayWithStripe}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-400 p-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
              data-testid="payment-stripe-btn"
            >
              <CreditCard className="h-5 w-5" />
              Pagar com Cartão
            </button>
            
            {/* Accepted Cards */}
            <div className="flex items-center justify-center gap-4 text-zinc-500">
              <span className="text-xs">Aceitamos:</span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium">Visa</span>
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium">Mastercard</span>
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium">Amex</span>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-zinc-500">
          Pagamento seguro processado pelo Stripe
        </p>
      </motion.div>
    </div>
  );
}

// Keep old component name for compatibility
function EasypayCheckoutModal({ open, onClose, orderData, onPaymentSuccess }) {
  return (
    <PaymentMethodModal
      open={open}
      onClose={onClose}
      orderData={orderData}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}

export default function App() {
  // ============ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS ============
  
  // Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [connectUser, setConnectUser] = useState(null);
  
  // Main website states
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
  const [serviceType, setServiceType] = useState("");

  // Payment states
  const [checkoutStep, setCheckoutStep] = useState("form");
  const [showEasypayCheckout, setShowEasypayCheckout] = useState(false);
  const [easypayOrderData, setEasypayOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Subscription states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  
  // Customer portal states
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);
  const [portalEmail, setPortalEmail] = useState("");
  const [customerSubscriptions, setCustomerSubscriptions] = useState([]);
  const [customerInterventions, setCustomerInterventions] = useState([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // ============ ALL EFFECTS ============
  
  // Navigation and session effect
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    
    const savedUser = localStorage.getItem('connect_user');
    if (savedUser) {
      try {
        setConnectUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('connect_user');
      }
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    trackPageView(`${currentPath}${window.location.search}`);
  }, [currentPath]);

  // Handle Connect login
  const handleConnectLogin = (user) => {
    setConnectUser(user);
    const role = user.role || 'CUSTOMER';
    if (role === 'ADMIN') {
      window.location.href = '/connect/admin';
    } else if (role === 'TECHNICIAN') {
      window.location.href = '/connect/tech';
    } else {
      window.location.href = '/connect/client';
    }
  };

  // Service types available
  const serviceTypes = [
    { value: "instalacao", label: "Instalacao" },
    { value: "reparacao", label: "Reparacao" },
    { value: "manutencao", label: "Manutencao" },
    { value: "visita_tecnica", label: "Visita Tecnica" },
    { value: "certificacao", label: "Certificacao" },
  ];

  // Handle OAuth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const calendarSuccess = urlParams.get('calendar_connected');
    const calendarError = urlParams.get('calendar_error');
    
    if (calendarSuccess === 'true') {
      setCalendarConnected(true);
      alert('Google Calendar conectado com sucesso!');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (calendarError) {
      alert('Erro ao conectar Google Calendar: ' + calendarError);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      // Process OAuth callback
      const state = urlParams.get('state');
      fetch(`${BACKEND_URL}/api/oauth/calendar/process-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCalendarConnected(true);
            alert('Google Calendar conectado com sucesso!');
          } else {
            alert('Erro ao conectar: ' + (data.error || 'Erro desconhecido'));
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          console.error('OAuth error:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  // Check calendar status on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/calendar/status`)
      .then(res => res.json())
      .then(data => setCalendarConnected(data.connected))
      .catch(err => console.log('Calendar status check failed'));
  }, []);

  // Fetch booked slots when date changes - using app API
  useEffect(() => {
    if (selectedDate) {
      setCheckingAvailability(true);
      
      // Check each time slot for availability using app API
      const checkSlots = async () => {
        const bookedList = [];
        
        for (const time of timeSlots) {
          try {
            const response = await fetch(
              `${ORDERS_API}/orders/check-availability?preferred_date=${selectedDate}T${time}&duration_hours=2`,
              { method: 'POST' }
            );
            const data = await response.json();
            
            if (data.has_conflict) {
              bookedList.push({
                date: selectedDate,
                start_time: time,
                title: 'Ocupado'
              });
            }
          } catch (err) {
            console.log('Failed to check slot:', time);
          }
        }
        
        setBookedSlots(bookedList);
        setCheckingAvailability(false);
      };
      
      checkSlots();
    }
  }, [selectedDate]);

  // Check if a time slot is booked
  const isTimeSlotBooked = (time) => {
    if (!selectedDate || !bookedSlots.length) return false;
    return bookedSlots.some(slot => 
      slot.date === selectedDate && slot.start_time === time
    );
  };

  // ============ CONDITIONAL ROUTING (after all hooks) ============

  // Route: /insights/{slug} - Published article page
  if (currentPath.startsWith('/insights/')) {
    const insightSlug = currentPath.replace('/insights/', '').split('/')[0];
    return <InsightArticle slug={insightSlug} />;
  }

  // Route: /connect/client - Client Dashboard
  if (currentPath === '/connect/client') {
    return <ConnectClientDashboard />;
  }
  
  // Route: /connect/tech - Technician Dashboard
  if (currentPath === '/connect/tech') {
    return <ConnectTechDashboard />;
  }
  
  // Route: /connect/admin - Admin Dashboard
  if (currentPath === '/connect/admin') {
    return <ConnectAdminDashboard />;
  }
  
  // Route: /connect - Show login page (with PWA Install Banner)
  if (currentPath.startsWith('/connect')) {
    return (
      <>
        <ConnectLogin onLogin={handleConnectLogin} />
        <PWAInstallBanner />
      </>
    );
  }

  // ============ MAIN WEBSITE RENDER ============

  const nav = [
    { label: "Inicio", id: "hero" },
    { label: "Servicos", id: "services" },
    { label: "Planos", id: "obelisco-care" },
    { label: "Vantagens", id: "vantagens" },
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
    setServiceType("");
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
      !selectedTime ||
      !serviceType
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
          serviceType: serviceType,
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

  // Save order to management app (automatically adds to Google Calendar)
  const saveOrderToApp = async (paymentStatus = "PENDENTE", paymentInfo = "") => {
    try {
      const servicesDescription = cart
        .map((item) => `${item.title} (${item.quantity}x) - EUR${item.price * item.quantity}`)
        .join("\n");

      const fullDescription = `SERVICOS SOLICITADOS:
${servicesDescription}

Subtotal: EUR${subtotal}
Taxa de deslocacao: EUR${travelFee}
Total: EUR${total}

ESTADO DO PAGAMENTO: ${paymentStatus}
${paymentInfo}

Codigo Postal: ${customerPostalCode || "Nao informado"}
Horario preferido: ${selectedTime}
Tipo de Servico: ${serviceTypes.find(s => s.value === serviceType)?.label || serviceType}
Observacoes: ${customerNotes || "Sem observacoes"}`;

      // Use the app API which automatically creates Google Calendar event
      const response = await fetch(`${ORDERS_API}/orders/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: customerName,
          email: customerEmail,
          phone: customerPhone.replace(/\s+/g, ""),
          address: customerAddress,
          service_type: serviceType,
          preferred_date: `${selectedDate}T${selectedTime}`,
          description: fullDescription,
        }),
      });
      
      const result = await response.json();
      console.log("Order created:", result);
      
      return true;
    } catch (error) {
      console.error("Error sending to management app:", error);
      return false;
    }
  };

  // Handle WhatsApp fallback (saves order first, then opens WhatsApp)
  const handleWhatsAppFallback = async () => {
    // Save order to app first
    await saveOrderToApp("PENDENTE - VIA WHATSAPP", "Cliente contactou via WhatsApp para finalizar pagamento");
    
    // Open WhatsApp
    const whatsappMsg = `Ola, gostaria de finalizar o meu pedido:
- Nome: ${customerName}
- Valor: EUR${total.toFixed(2)}
- Data: ${selectedDate}
- Hora: ${selectedTime}
- Tipo: ${serviceTypes.find(s => s.value === serviceType)?.label || serviceType}`;
    
    window.open(`https://wa.me/351911132401?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    
    // Close checkout and show success
    setShowEasypayCheckout(false);
    setCheckoutStep("success");
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentData) => {
    console.log("Payment success:", paymentData);
    setShowEasypayCheckout(false);

    // Send order to management app
    await saveOrderToApp(
      "PAGAMENTO CONFIRMADO via Easypay",
      `ID Pagamento: ${paymentData.paymentId}\nMetodo: ${paymentData.method || "Online"}`
    );

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
              href="/connect"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-400"
              data-testid="customer-portal-btn"
            >
              Obelisco Connect
            </a>

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

              {/* Obelisco Connect Link */}
              <a
                href="/connect"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 py-3 text-center font-semibold text-yellow-400 transition hover:bg-yellow-500/20"
              >
                Obelisco Connect
              </a>

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
        {/* Hero Carousel Section */}
        <HeroCarousel scrollToSection={scrollToSection} />

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
                      <div>
                        <span className="text-lg font-bold text-yellow-300">
                          EUR{service.price}
                        </span>
                        {service.priceNote && (
                          <span className="ml-1 text-sm text-zinc-500">
                            {service.priceNote}
                          </span>
                        )}
                      </div>

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

                <p className="leading-7 text-zinc-300">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-5 font-semibold text-white">{item.name}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================== OBELISCO CARE - SUBSCRIPTION PLANS ==================== */}
        <section
          id="obelisco-care"
          className="border-y border-yellow-500/20 bg-gradient-to-b from-zinc-950 to-zinc-900 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2"
              >
                <Shield className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Planos de Manutencao</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl"
              >
                Obelisco <span className="text-yellow-400">Care</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400"
              >
                Planos de manutencao e suporte tecnico para empresas e condominios.
                Previna avarias, reduza custos e tenha resposta prioritaria.
              </motion.p>
              
              {/* Billing Cycle Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="mt-8 flex items-center justify-center gap-4"
              >
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-xl px-6 py-3 font-semibold transition ${
                    billingCycle === "monthly"
                      ? "bg-yellow-400 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`relative rounded-xl px-6 py-3 font-semibold transition ${
                    billingCycle === "annual"
                      ? "bg-yellow-400 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Anual
                  <span className="absolute -right-2 -top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                    -2 meses
                  </span>
                </button>
              </motion.div>
            </div>

            {/* Pricing Cards */}
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {/* Plan: Essencial */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Essencial</h3>
                  <p className="mt-1 text-sm text-zinc-400">Suporte para o dia a dia da sua operacao</p>
                </div>
                
                <div className="mb-6">
                  {billingCycle === "monthly" ? (
                    <>
                      <span className="text-4xl font-black text-white">349</span>
                      <span className="text-xl text-zinc-400">EUR/mes</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-white">3.490</span>
                      <span className="text-xl text-zinc-400">EUR/ano</span>
                      <p className="mt-1 text-sm text-green-400">Poupa 698 EUR (2 meses gratis)</p>
                    </>
                  )}
                </div>
                
                <ul className="mb-8 space-y-3">
                  {[
                    "Ate 3 horas de intervencao tecnica/mes",
                    "Deslocacao incluida na Grande Lisboa",
                    "Prioridade de resposta: ate 48h uteis",
                    "1 visita preventiva semestral",
                    "Apoio telefonico e diagnostico remoto",
                    "5% de desconto em horas adicionais",
                    "Relatorio tecnico semestral"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <p className="mb-4 text-xs text-zinc-500">
                  Ideal para pequenas empresas, lojas e escritorios
                </p>
                
                <button
                  onClick={() => {
                    setSelectedPlan({
                      id: "essencial",
                      lookup_key: billingCycle === "monthly" ? "essencial_monthly" : "essencial_annual",
                      name: "Essencial",
                      price: billingCycle === "monthly" ? 349 : 3490,
                      billing_cycle: billingCycle
                    });
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full rounded-2xl border border-yellow-400 bg-transparent px-6 py-4 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-zinc-950"
                  data-testid="plan-essencial-btn"
                >
                  Subscrever Plano
                </button>
              </motion.div>

              {/* Plan: Preventivo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Preventivo</h3>
                  <p className="mt-1 text-sm text-zinc-400">Prevencao que evita custos e paragens</p>
                </div>
                
                <div className="mb-6">
                  {billingCycle === "monthly" ? (
                    <>
                      <span className="text-4xl font-black text-white">699</span>
                      <span className="text-xl text-zinc-400">EUR/mes</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-white">6.990</span>
                      <span className="text-xl text-zinc-400">EUR/ano</span>
                      <p className="mt-1 text-sm text-green-400">Poupa 1.398 EUR (2 meses gratis)</p>
                    </>
                  )}
                </div>
                
                <ul className="mb-8 space-y-3">
                  {[
                    "Ate 6 horas de intervencao tecnica/mes",
                    "Deslocacao incluida na Grande Lisboa",
                    "Prioridade de resposta: ate 24h uteis",
                    "2 visitas preventivas por ano",
                    "Manutencao preventiva programada",
                    "10% de desconto em horas adicionais",
                    "Relatorio tecnico trimestral"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <p className="mb-4 text-xs text-zinc-500">
                  Ideal para empresas e edificios que pretendem reduzir avarias e custos
                </p>
                
                <button
                  onClick={() => {
                    setSelectedPlan({
                      id: "preventivo",
                      lookup_key: billingCycle === "monthly" ? "preventivo_monthly" : "preventivo_annual",
                      name: "Preventivo",
                      price: billingCycle === "monthly" ? 699 : 6990,
                      billing_cycle: billingCycle
                    });
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full rounded-2xl border border-yellow-400 bg-transparent px-6 py-4 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-zinc-950"
                  data-testid="plan-preventivo-btn"
                >
                  Subscrever Plano
                </button>
              </motion.div>

              {/* Plan: Total (Popular) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative rounded-3xl border-2 border-yellow-400 bg-zinc-900 p-8"
              >
                {/* Popular Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-bold text-zinc-950">
                    Mais Procurado
                  </span>
                </div>
                
                <div className="mb-6 mt-2">
                  <h3 className="text-2xl font-bold text-white">Total</h3>
                  <p className="mt-1 text-sm text-zinc-400">Cobertura completa, tranquilidade total</p>
                </div>
                
                <div className="mb-6">
                  {billingCycle === "monthly" ? (
                    <>
                      <span className="text-4xl font-black text-yellow-400">1.290</span>
                      <span className="text-xl text-zinc-400">EUR/mes</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-yellow-400">12.900</span>
                      <span className="text-xl text-zinc-400">EUR/ano</span>
                      <p className="mt-1 text-sm text-green-400">Poupa 2.580 EUR (2 meses gratis)</p>
                    </>
                  )}
                </div>
                
                <ul className="mb-8 space-y-3">
                  {[
                    "Ate 12 horas de intervencao tecnica/mes",
                    "Deslocacao incluida na Grande Lisboa",
                    "Prioridade de resposta: ate 8h uteis",
                    "2 visitas preventivas trimestrais",
                    "Manutencao preventiva e corretiva",
                    "Consultoria tecnica e pequenas melhorias",
                    "15% de desconto em horas adicionais",
                    "Relatorio tecnico mensal"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <p className="mb-4 text-xs text-zinc-500">
                  Ideal para empresas, condominios e operacoes criticas
                </p>
                
                <button
                  onClick={() => {
                    setSelectedPlan({
                      id: "total",
                      lookup_key: billingCycle === "monthly" ? "total_monthly" : "total_annual",
                      name: "Total",
                      price: billingCycle === "monthly" ? 1290 : 12900,
                      billing_cycle: billingCycle
                    });
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full rounded-2xl bg-yellow-400 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300"
                  data-testid="plan-total-btn"
                >
                  Subscrever Plano
                </button>
              </motion.div>
            </div>

            {/* What's Included Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-16 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8"
            >
              <h3 className="mb-6 text-xl font-bold text-white">O que esta incluido em todos os planos</h3>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Clock3, title: "Resposta Definida", text: "Prazos de resposta claros e prioritarios" },
                  { icon: ShieldCheck, title: "Prevencao e Seguranca", text: "Menos avarias, mais seguranca" },
                  { icon: FileText, title: "Controlo de Custos", text: "Orcamentacao previsivel e sem surpresas" },
                  { icon: Users, title: "Um Unico Parceiro", text: "Eletricidade, telecomunicacoes, CCTV, intrusao" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                      <item.icon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-zinc-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Conditions Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h4 className="mb-3 text-sm font-semibold text-zinc-300">Condicoes importantes</h4>
              <ul className="space-y-1.5 text-xs text-zinc-500">
                <li>• Materiais e equipamentos nao estao incluidos</li>
                <li>• Horas nao sao acumulaveis de um mes para o outro</li>
                <li>• Ultrapassado o limite de horas, aplica-se a tabela preferencial do plano contratado</li>
                <li>• Servicos de urgencia fora do horario comercial sujeitos a disponibilidade</li>
                <li>• Subscricao mensal - pode cancelar a qualquer momento</li>
              </ul>
            </motion.div>
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
                            Tipo de Servico
                          </h3>
                          <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                            data-testid="service-type-select"
                          >
                            <option value="">Selecione o tipo de servico *</option>
                            {serviceTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                          <h3 className="mb-5 text-xl font-bold text-white">
                            Agendamento
                          </h3>
                          <p className="mb-4 text-sm text-zinc-400">
                            Segunda a Sexta, das 8h às 18h
                          </p>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <div className="relative">
                                <input
                                  type="date"
                                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                  value={selectedDate}
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    const selectedDateObj = new Date(selectedValue);
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    tomorrow.setHours(0, 0, 0, 0);
                                    
                                    // Silently reject today or past dates
                                    if (selectedDateObj < tomorrow) {
                                      return;
                                    }
                                    
                                    const day = selectedDateObj.getDay();
                                    // Silently reject weekends
                                    if (day === 0 || day === 6) {
                                      return;
                                    }
                                    setSelectedDate(selectedValue);
                                  }}
                                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                                  data-testid="date-input"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>
                              {selectedDate && (
                                <p className="mt-1 text-xs text-zinc-500">
                                  {new Date(selectedDate).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                              )}
                            </div>

                            <select
                              value={selectedTime}
                              onChange={(e) => {
                                const time = e.target.value;
                                if (isTimeSlotBooked(time)) {
                                  return;
                                }
                                setSelectedTime(time);
                              }}
                              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                              data-testid="time-select"
                              disabled={checkingAvailability}
                              style={{ colorScheme: 'dark' }}
                            >
                              <option value="">{checkingAvailability ? 'A verificar...' : 'Escolher hora *'}</option>
                              {timeSlots.map((slot) => {
                                const booked = isTimeSlotBooked(slot);
                                return (
                                  <option 
                                    key={slot} 
                                    value={slot}
                                    disabled={booked}
                                    style={{ color: booked ? '#ef4444' : 'inherit' }}
                                  >
                                    {slot} {booked ? '(Ocupado)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          
                          {selectedDate && (
                            <p className="mt-2 text-sm text-green-500">
                              ✓ Verificação de disponibilidade activa
                            </p>
                          )}
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
                          Pagar com Cartao
                        </span>
                      )}
                    </button>

                    <p className="mt-4 text-center text-xs text-zinc-500">
                      Pagamento seguro processado pelo Stripe
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      <EasypayCheckoutModal
        open={showEasypayCheckout}
        onClose={() => setShowEasypayCheckout(false)}
        orderData={easypayOrderData}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                setSelectedPlan(null);
                setSubscriptionError("");
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Subscrever Plano {selectedPlan.name}</h2>
                <p className="text-sm text-zinc-400">Preencha os seus dados para continuar</p>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Obelisco Care - {selectedPlan.name}</p>
                  <p className="text-sm text-zinc-400">Subscricao {selectedPlan.billing_cycle === "annual" ? "anual" : "mensal"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{selectedPlan.price.toLocaleString()}EUR</p>
                  <p className="text-xs text-zinc-400">/{selectedPlan.billing_cycle === "annual" ? "ano" : "mes"}</p>
                </div>
              </div>
              {selectedPlan.billing_cycle === "annual" && (
                <p className="mt-2 text-sm text-green-400">2 meses gratis incluidos!</p>
              )}
            </div>

            {subscriptionError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
                {subscriptionError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubscriptionLoading(true);
                setSubscriptionError("");

                const formData = new FormData(e.target);
                const name = formData.get("sub_name");
                const email = formData.get("sub_email");
                const phone = formData.get("sub_phone");

                try {
                  const response = await fetch(`${BACKEND_URL}/api/stripe/create-subscription-session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      lookup_key: selectedPlan.lookup_key,
                      customer_email: email,
                      customer_name: name,
                      customer_phone: phone,
                      origin_url: window.location.origin + "/#obelisco-care"
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.detail || "Erro ao criar sessão de pagamento");
                  }

                  if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                  } else {
                    throw new Error("URL de checkout não recebida");
                  }
                } catch (err) {
                  console.error("Subscription error:", err);
                  setSubscriptionError(err.message || "Erro ao processar. Por favor, tente novamente.");
                  setSubscriptionLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Nome completo *</label>
                <input
                  type="text"
                  name="sub_name"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                  placeholder="O seu nome"
                  data-testid="subscription-name-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email *</label>
                <input
                  type="email"
                  name="sub_email"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                  placeholder="email@exemplo.pt"
                  data-testid="subscription-email-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Telefone</label>
                <input
                  type="tel"
                  name="sub_phone"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                  placeholder="911 222 333"
                  data-testid="subscription-phone-input"
                />
              </div>

              <button
                type="submit"
                disabled={subscriptionLoading}
                className="mt-4 w-full rounded-2xl bg-yellow-400 px-6 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="subscription-submit-btn"
              >
                {subscriptionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    A redirecionar...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pagar {selectedPlan.price.toLocaleString()}EUR/{selectedPlan.billing_cycle === "annual" ? "ano" : "mes"}
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-zinc-500">
                Pode cancelar a qualquer momento. Pagamento seguro pelo Stripe.
              </p>
            </form>
          </motion.div>
        </div>
      )}

      {/* Customer Portal Modal */}
      {showCustomerPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <button
              onClick={() => {
                setShowCustomerPortal(false);
                setCustomerSubscriptions([]);
                setCustomerInterventions([]);
                setSelectedSubscription(null);
                setShowInterventionForm(false);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Area de Cliente</h2>
                <p className="text-sm text-zinc-400">Aceda as suas subscricoes e pedidos</p>
              </div>
            </div>

            {!selectedSubscription ? (
              <>
                {/* Email Login */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPortalLoading(true);
                    const email = e.target.portal_email.value;
                    setPortalEmail(email);

                    try {
                      const [subsRes, intRes] = await Promise.all([
                        fetch(`${BACKEND_URL}/api/customer/subscriptions?email=${encodeURIComponent(email)}`),
                        fetch(`${BACKEND_URL}/api/customer/interventions?email=${encodeURIComponent(email)}`)
                      ]);
                      
                      const subsData = await subsRes.json();
                      const intData = await intRes.json();
                      
                      setCustomerSubscriptions(subsData.subscriptions || []);
                      setCustomerInterventions(intData.interventions || []);
                    } catch (err) {
                      console.error("Error fetching data:", err);
                    }
                    setPortalLoading(false);
                  }}
                  className="mb-6"
                >
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email da subscricao</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="portal_email"
                      required
                      defaultValue={portalEmail}
                      className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                      placeholder="email@exemplo.pt"
                      data-testid="portal-email-input"
                    />
                    <button
                      type="submit"
                      disabled={portalLoading}
                      className="rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
                    >
                      {portalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Aceder"}
                    </button>
                  </div>
                </form>

                {/* Subscriptions List */}
                {customerSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">As suas subscricoes</h3>
                    {customerSubscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-yellow-400"
                        onClick={() => setSelectedSubscription(sub)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">Plano {sub.plan_name}</p>
                            <p className="text-sm text-zinc-400">{sub.amount}EUR/{sub.billing_cycle === "annual" ? "ano" : "mes"}</p>
                          </div>
                          <div className="text-right">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              sub.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                            }`}>
                              {sub.status === "active" ? "Ativo" : sub.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex-1 rounded-full bg-zinc-800 h-2">
                            <div
                              className="h-2 rounded-full bg-yellow-400"
                              style={{ width: `${Math.min(100, (sub.hours_used / sub.hours_included) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-zinc-400">
                            {sub.hours_used || 0}h / {sub.hours_included}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : portalEmail && !portalLoading ? (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
                    <p className="text-zinc-400">Nenhuma subscricao encontrada para este email.</p>
                    <button
                      onClick={() => {
                        setShowCustomerPortal(false);
                        document.getElementById("obelisco-care")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 rounded-xl bg-yellow-400 px-6 py-2 font-semibold text-zinc-950"
                    >
                      Ver Planos Disponiveis
                    </button>
                  </div>
                ) : null}

                {/* Recent Interventions */}
                {customerInterventions.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-white">Pedidos de intervencao recentes</h3>
                    {customerInterventions.slice(0, 3).map((int) => (
                      <div key={int.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white">{int.description.slice(0, 50)}...</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            int.status === "completed" ? "bg-green-500/20 text-green-400" :
                            int.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-zinc-700 text-zinc-400"
                          }`}>
                            {int.status === "pending" ? "Pendente" : int.status === "completed" ? "Concluido" : int.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Subscription Details */}
                <button
                  onClick={() => {
                    setSelectedSubscription(null);
                    setShowInterventionForm(false);
                  }}
                  className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>

                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">Plano {selectedSubscription.plan_name}</p>
                      <p className="text-sm text-zinc-400">{selectedSubscription.customer_email}</p>
                    </div>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                      Ativo
                    </span>
                  </div>
                </div>

                {/* Hours Usage */}
                <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <h4 className="mb-3 font-semibold text-white">Horas deste periodo</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-4 rounded-full bg-zinc-800">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                          style={{ width: `${Math.min(100, ((selectedSubscription.hours_used || 0) / selectedSubscription.hours_included) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">
                        {(selectedSubscription.hours_included - (selectedSubscription.hours_used || 0)).toFixed(1)}h
                      </p>
                      <p className="text-xs text-zinc-500">disponiveis de {selectedSubscription.hours_included}h</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setShowInterventionForm(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-950 hover:bg-yellow-300"
                    data-testid="request-intervention-btn"
                  >
                    <Wrench className="h-5 w-5" />
                    Pedir Intervencao
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${BACKEND_URL}/api/customer/portal-session?email=${encodeURIComponent(selectedSubscription.customer_email)}&return_url=${encodeURIComponent(window.location.href)}`, {
                          method: "POST"
                        });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (err) {
                        console.error("Portal error:", err);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-white hover:border-yellow-400"
                  >
                    <CreditCard className="h-5 w-5" />
                    Gerir Pagamento
                  </button>
                </div>

                {/* Intervention Form */}
                {showInterventionForm && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setPortalLoading(true);
                      
                      const formData = new FormData(e.target);
                      
                      try {
                        const res = await fetch(`${BACKEND_URL}/api/customer/intervention`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            subscription_id: selectedSubscription.id,
                            customer_email: selectedSubscription.customer_email,
                            description: formData.get("int_description"),
                            urgency: formData.get("int_urgency"),
                            preferred_date: formData.get("int_date"),
                            preferred_time: formData.get("int_time"),
                            address: formData.get("int_address")
                          })
                        });
                        
                        const data = await res.json();
                        
                        if (data.success) {
                          alert("Pedido de intervencao enviado com sucesso! Entraremos em contacto brevemente.");
                          setShowInterventionForm(false);
                        } else {
                          alert(data.detail || "Erro ao enviar pedido");
                        }
                      } catch (err) {
                        console.error("Error:", err);
                        alert("Erro ao enviar pedido");
                      }
                      setPortalLoading(false);
                    }}
                    className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <h4 className="font-semibold text-white">Novo Pedido de Intervencao</h4>
                    
                    <div>
                      <label className="mb-1 block text-sm text-zinc-400">Descricao do problema *</label>
                      <textarea
                        name="int_description"
                        required
                        rows={3}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                        placeholder="Descreva o problema ou servico necessario..."
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm text-zinc-400">Urgencia</label>
                        <select
                          name="int_urgency"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                        >
                          <option value="normal">Normal (ate 48h)</option>
                          <option value="urgent">Urgente (ate 8h)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-zinc-400">Data preferida</label>
                        <input
                          type="date"
                          name="int_date"
                          min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm text-zinc-400">Hora preferida</label>
                        <select
                          name="int_time"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                        >
                          <option value="">Qualquer hora</option>
                          <option value="08:00">08:00</option>
                          <option value="10:00">10:00</option>
                          <option value="14:00">14:00</option>
                          <option value="16:00">16:00</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-zinc-400">Morada</label>
                        <input
                          type="text"
                          name="int_address"
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                          placeholder="Morada do servico"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={portalLoading}
                      className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
                    >
                      {portalLoading ? "A enviar..." : "Enviar Pedido"}
                    </button>
                  </form>
                )}
              </>
            )}
          </motion.div>
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
