import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { updateSEO } from "../utils/seo";
import { LabsHero, LabsBenefits } from "../components/LabsComponents";

const products = [
  {
    id: "domos",
    name: "DOMOS",
    icon: "📊",
    tagline: "A gestão que se adapta à sua profissão.",
    category: "GESTÃO EMPRESARIAL",
    description:
      "Plataforma de gestão para empresas e profissionais de serviços técnicos.",
    features: [
      "Clientes, orçamentos e serviços",
      "Obras, equipas e agenda",
      "Relatórios e indicadores",
    ],
    cta: "CONHECER DOMOS",
    href: "/labs/domos",
  },
  {
    id: "fluxos",
    name: "FLUXOS",
    icon: "🔄",
    tagline: "Automatize processos, ganhe eficiência.",
    category: "AUTOMAÇÃO",
    description:
      "Automação de fluxos de trabalho para eliminar tarefas repetitivas.",
    features: [
      "Fluxos de trabalho inteligentes",
      "Aprovações e notificações",
      "Integrações com tuas ferramentas",
    ],
    cta: "EM BREVE",
    href: "#",
    disabled: true,
  },
  {
    id: "tracker",
    name: "TRACKER",
    icon: "📍",
    tagline: "Monitore o que importa em tempo real.",
    category: "MONITORIZAÇÃO",
    description: "Dashboard em tempo real para acompanhar KPIs e métricas.",
    features: [
      "Indicadores em tempo real",
      "Alertas e eventos",
      "Dashboards personalizados",
    ],
    cta: "EM BREVE",
    href: "#",
    disabled: true,
  },
  {
    id: "embreve",
    name: "EM BREVE",
    icon: "🚀",
    tagline: "Novas soluções estão chegando.",
    category: "INOVAÇÃO",
    description: "Estamos desenvolvendo novas ferramentas para transformar gestão.",
    features: [
      "Mais soluções em desenvolvimento",
      "Roadmap publicado em breve",
      "Participe do programa beta",
    ],
    cta: "SAIBA MAIS",
    href: "#",
    disabled: true,
  },
];

const forWho = [
  {
    icon: "🏢",
    title: "Pequenos negócios",
    desc: "Organize, controle e cresça com eficiência.",
  },
  {
    icon: "📈",
    title: "Empresas em crescimento",
    desc: "Estruture processos e ganhe escala.",
  },
  {
    icon: "👷",
    title: "Equipas técnicas",
    desc: "Gestão completa das operações no terreno.",
  },
  {
    icon: "👔",
    title: "Gestores e empreendedores",
    desc: "Informação clara para melhores decisões.",
  },
];

export function LabsPage() {
  useEffect(() => {
    updateSEO({
      title: "Obelisco Labs | Tecnologia e soluções digitais para empresas",
      description:
        "Conheça a divisão de tecnologia da Obelisco Radical e nossas soluções digitais para gestão, produtividade e crescimento empresarial.",
      canonical: "https://www.obeliscoradical.pt/labs",
      ogTitle: "Obelisco Labs — Tecnologia que transforma gestão em resultados",
      ogDescription:
        "Aplicações e soluções digitais para empresas que querem simplificar gestão e crescer.",
      schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Obelisco Labs",
        description: "Divisão de tecnologia da Obelisco Radical",
        url: "https://www.obeliscoradical.pt/labs",
      },
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white pt-20">
      <style>{`
        html { scroll-behavior: smooth; }
        body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        h1,h2,h3,h4,h5,h6 { font-family: Oswald, Inter, sans-serif; }
      `}</style>

      {/* Hero */}
      <LabsHero />

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Benefits */}
      <LabsBenefits />

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Institutional Message */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur p-8 sm:p-12"
          >
            <h2 className="text-4xl font-black uppercase text-white sm:text-5xl">
              Obelisco Labs
            </h2>
            <p className="mt-4 text-lg text-zinc-300">
              A divisão de tecnologia e produtos digitais da{" "}
              <span className="font-bold text-yellow-400">Obelisco Radical</span>.
            </p>
            <p className="mt-6 max-w-3xl mx-auto text-lg leading-relaxed text-zinc-400">
              Do serviço técnico à inovação digital, criamos soluções para resolver
              problemas reais de empresas reais.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Products */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tight text-white">
              Nossos <span className="text-yellow-400">produtos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
              Soluções criadas para empresas que querem ir mais longe.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col rounded-2xl border p-6 transition ${
                  product.disabled
                    ? "border-slate-700 bg-slate-900/50"
                    : "border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-blue-500/5 hover:border-violet-500/60"
                }`}
              >
                <div className="text-4xl mb-4">{product.icon}</div>

                <h3 className="text-2xl font-black text-white">{product.name}</h3>

                <div className="mt-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
                  {product.category}
                </div>

                <p className="mt-3 font-semibold text-zinc-300 text-sm">
                  {product.tagline}
                </p>

                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">
                  {product.description}
                </p>

                <ul className="mt-6 space-y-2">
                  {product.features.map((feat, j) => (
                    <li key={j} className="flex gap-2 text-xs text-zinc-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={product.disabled}
                  onClick={() => {
                    if (!product.disabled) window.location.href = product.href;
                  }}
                  className={`mt-6 rounded-2xl px-4 py-3 text-sm font-bold uppercase transition w-full ${
                    product.disabled
                      ? "border border-slate-700 text-slate-400 cursor-not-allowed"
                      : "border border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                  }`}
                >
                  {product.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Para quem é */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tight text-white">
              Para quem é <span className="text-yellow-400">Labs</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              Tecnologia para diferentes desafios, o mesmo objetivo: fazer seu negócio crescer.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {forWho.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* CTA Final */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-8 sm:p-16 text-center backdrop-blur shadow-2xl shadow-violet-500/10"
        >
          <h2 className="text-5xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Pronto para transformar a gestão
            <span className="block text-yellow-400">da sua empresa?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">
            Descubra o poder das nossas soluções. Comece hoje.
          </p>

          <div className="mt-10 flex flex-col gap-4 justify-center sm:flex-row">
            <a
              href="/labs/domos"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 font-bold text-white transition hover:from-violet-500 hover:to-purple-500 text-lg uppercase tracking-wide shadow-lg shadow-violet-500/20"
            >
              Conheça o DOMOS
              <ArrowRight className="ml-3 h-5 w-5" />
            </a>

            <a
              href="https://wa.me/351911132401?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20Obelisco%20Labs"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-violet-500/50 px-10 py-5 font-bold text-white transition hover:bg-violet-500/10 text-lg uppercase tracking-wide"
            >
              Falar com especialista
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer Notes */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 text-center text-sm text-zinc-500">
        <p>
          Obelisco Labs é a divisão de tecnologia da{" "}
          <a href="/" className="hover:text-zinc-300 transition">
            Obelisco Radical
          </a>
        </p>
      </section>
    </main>
  );
}
