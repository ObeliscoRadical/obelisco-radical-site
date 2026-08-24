import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  BarChart3,
  Users,
  Clock,
  Zap,
  TrendingUp,
  Smartphone,
  Shield,
  Gauge,
} from "lucide-react";
import { updateSEO } from "../utils/seo";

const segments = [
  { name: "Eletricidade", icon: Zap },
  { name: "Canalização", icon: Clock },
  { name: "AVAC", icon: BarChart3 },
  { name: "CCTV", icon: Users },
  { name: "Telecomunicações/ITED", icon: FileText },
  { name: "Solar", icon: Zap },
  { name: "Manutenção Técnica", icon: Clock },
];

const operationalFlow = [
  { step: "CLIENTE", desc: "Contacto e identificação" },
  { step: "ORÇAMENTO", desc: "Proposta personalizada" },
  { step: "SERVIÇO", desc: "Execução profissional" },
  { step: "OBRA", desc: "Gestão integrada" },
  { step: "AGENDA", desc: "Agendamento automático" },
  { step: "GESTÃO", desc: "Faturação e relatórios" },
];

const plans = [
  {
    name: "Start",
    price: "€9,90",
    desc: "/mês",
    features: [
      "Até 5 orçamentos/mês",
      "Básico de agendamento",
      "Contactos ilimitados",
    ],
    cta: "Começar",
  },
  {
    name: "Pro",
    price: "€29,90",
    desc: "/mês",
    features: [
      "Orçamentos ilimitados",
      "Agendamento completo",
      "Faturação integrada",
      "Relatórios básicos",
      "Suporte prioritário",
    ],
    cta: "Escolher",
    featured: true,
  },
  {
    name: "Complete",
    price: "€59,90",
    desc: "/mês",
    features: [
      "Tudo no Pro",
      "Análise avançada",
      "Portal do cliente",
      "API personalizada",
      "Suporte 24/7",
      "Integrações extras",
    ],
    cta: "Começar",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Faturação 3x mais rápida",
    desc: "De dias para minutos. Orçamentos profissionais, propostas automáticas, faturação sem erros.",
  },
  {
    icon: Smartphone,
    title: "Cliente sempre informado",
    desc: "Portal dedicado. Status da obra em tempo real. Transparência que gera confiança.",
  },
  {
    icon: Shield,
    title: "Nenhum orçamento perdido",
    desc: "Histórico centralizado. Rastreabilidade total. Sem WhatsApp caótico, sem papéis.",
  },
  {
    icon: Gauge,
    title: "Dados que vendem",
    desc: "Analytics real. Sabe qual obra lucra, qual cliente demora, onde está o dinheiro.",
  },
];

export function DomosPage() {
  useEffect(() => {
    updateSEO({
      title: "DOMOS | Gestão de Obras e Orçamentos",
      description:
        "Plataforma DOMOS para gestão de serviços técnicos. Orçamentos, obras, agendamento, faturação. €9,90/mês Start, €29,90/mês Pro, €59,90/mês Complete.",
      canonical: "https://www.obeliscoradical.pt/domos",
      ogTitle: "DOMOS — A gestão que se adapta à sua profissão",
      ogDescription:
        "Plataforma integrada para profissionais de serviços (eletricidade, canalização, AVAC, CCTV, telecomunicações, solar, manutenção).",
      schema: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "DOMOS",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "9.90",
          priceCurrency: "EUR",
        },
        url: "https://www.obeliscoradical.pt/domos",
      },
    });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-20">
      <style>{`
        html { scroll-behavior: smooth; }
        body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        h1,h2,h3,h4,h5,h6 { font-family: Oswald, Inter, sans-serif; }
        .electric-glow { text-shadow: 0 0 16px rgba(250, 204, 21, 0.35), 0 0 36px rgba(250, 204, 21, 0.12); }
      `}</style>

      {/* Hero — Copy Vencedor */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.18) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300"
          >
            🚀 Revolução da gestão técnica
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="electric-glow text-6xl font-black uppercase leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            DOMOS
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 text-3xl font-black uppercase text-yellow-400 sm:text-4xl lg:text-5xl"
          >
            A gestão que se adapta à sua profissão
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 max-w-3xl text-xl leading-relaxed text-zinc-200 sm:text-2xl"
          >
            Cansado de orçamentos no WhatsApp? Agendamentos que se perdem? Faturas que aparecem dias depois?
            <span className="block mt-4 font-bold text-yellow-300">
              DOMOS centraliza tudo. Orçamentos em 2 minutos. Cliente sempre informado. Faturação automática.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={() => {
                document.getElementById("benefits")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-5 text-lg font-black uppercase tracking-wide text-zinc-950 transition hover:bg-yellow-300 shadow-2xl"
            >
              Descubra como funciona
              <ArrowRight className="ml-3 h-5 w-5" />
            </button>

            <a
              href="https://wa.me/351911132401?text=Olá,%20tenho%20interesse%20no%20DOMOS"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-yellow-400 px-8 py-5 text-lg font-bold text-yellow-300 transition hover:bg-yellow-400/10"
            >
              Falar com especialista
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 grid gap-6 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-400/5 p-6 backdrop-blur">
              <div className="text-3xl font-black text-yellow-400">30 dias</div>
              <div className="mt-2 text-sm text-zinc-300">Teste gratuito, sem cartão</div>
            </div>
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-400/5 p-6 backdrop-blur">
              <div className="text-3xl font-black text-yellow-400">500+</div>
              <div className="mt-2 text-sm text-zinc-300">Profissionais já usam</div>
            </div>
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-400/5 p-6 backdrop-blur">
              <div className="text-3xl font-black text-yellow-400">4.9★</div>
              <div className="mt-2 text-sm text-zinc-300">Avaliação média de clientes</div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

      {/* Showcase — Vídeo */}
      <section className="bg-zinc-900/50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tight text-white">
              Você presta <span className="text-yellow-400">serviços técnicos?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Eletricidade, canalização, AVAC, CCTV, telecomunicações, solar. O DOMOS é para você.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 overflow-hidden shadow-2xl shadow-yellow-500/10">
            <video
              className="w-full h-auto"
              controls
              controlsList="nodownload"
            >
              <source src="/images/domos-showcase.mp4" type="video/mp4" />
              Seu navegador não suporta vídeo HTML5.
            </video>
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl font-black text-white uppercase">
              O <span className="text-yellow-400">DOMOS</span> é para você.
            </p>
            <p className="mt-3 text-lg font-bold text-zinc-300">
              A gestão que se adapta à sua profissão.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits — Visual + Copy */}
      <section
        id="benefits"
        className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tight text-white">
              O que você ganha com <span className="text-yellow-400">DOMOS</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Não é só software. É liberdade. É dados. É crescimento.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 hover:border-yellow-500/40 transition"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 leading-7 text-zinc-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Para todos os <span className="text-yellow-400">segmentos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Eletricistas. Canalizadores. HVAC. CCTV. Telecomunicações. Solar. Manutenção. DOMOS funciona para você.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {segments.map((seg, i) => {
            const Icon = seg.icon;
            return (
              <motion.div
                key={seg.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center transition hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10"
              >
                <Icon className="mx-auto h-8 w-8 text-yellow-400" />
                <div className="mt-3 font-semibold text-white text-sm">
                  {seg.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Fluxo Operacional */}
      <section className="bg-zinc-900/50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              O ciclo completo — <span className="text-yellow-400">automatizado</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              Do primeiro contacto à fatura. Tudo conectado. Nada se perde.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {operationalFlow.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center"
              >
                <div className="text-2xl font-black text-yellow-400">
                  {i + 1}
                </div>
                <div className="mt-3 font-bold text-white text-sm">{item.step}</div>
                <div className="mt-1 text-xs text-zinc-400">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Planos e <span className="text-yellow-400">preços</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Comece pequeno. Cresça sem limites. Cancele quando quiser.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col rounded-3xl border p-8 transition ${
                plan.featured
                  ? "border-yellow-400 bg-yellow-400/5 shadow-2xl shadow-yellow-400/10"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              {plan.featured && (
                <div className="mb-4 inline-flex w-fit rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300 border border-yellow-500/30">
                  MAIS PROCURADO
                </div>
              )}

              <h3 className="text-2xl font-black text-white">{plan.name}</h3>
              <div className="mt-2 text-3xl font-black text-yellow-400">
                {plan.price}
                <span className="text-sm font-medium text-zinc-400">
                  {plan.desc}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-yellow-400" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  window.open(
                    "https://wa.me/351911132401?text=Olá,%20tenho%20interesse%20no%20plano%20" +
                      plan.name,
                    "_blank"
                  );
                }}
                className={`mt-8 rounded-2xl px-6 py-4 font-bold transition uppercase tracking-wide ${
                  plan.featured
                    ? "bg-yellow-400 text-zinc-950 hover:bg-yellow-300"
                    : "border border-zinc-700 text-white hover:border-yellow-400 hover:text-yellow-300"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-300">
          <p>
            ✓ 30 dias de teste grátis  |  ✓ Sem cartão de crédito  |  ✓ Cancele a qualquer momento
          </p>
        </div>
      </section>

      {/* CTA Final — Heróica */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 sm:p-16 text-center shadow-2xl shadow-yellow-500/10"
        >
          <h2 className="text-5xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Pronto para <span className="text-yellow-400">crescer?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">
            Milhares de profissionais já usam DOMOS. Eletricistas faturar mais. Canalizadores trabalham melhor. Técnicos de HVAC ganham tempo.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-bold text-yellow-300">
            Sua vez é agora.
          </p>

          <div className="mt-10 flex flex-col gap-4 justify-center sm:flex-row">
            <a
              href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20começar%20o%20teste%20gratuito%20do%20DOMOS"
              className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-10 py-5 font-bold text-zinc-950 transition hover:bg-yellow-300 text-lg uppercase tracking-wide shadow-lg"
            >
              Começar teste gratuito
            </a>

            <button
              onClick={() => {
                document.getElementById("benefits")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-yellow-400/30 bg-yellow-400/5 px-10 py-5 font-bold text-yellow-300 transition hover:bg-yellow-400/10 text-lg uppercase tracking-wide"
            >
              Saber mais
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
