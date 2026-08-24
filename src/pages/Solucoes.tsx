import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { products } from "../data/products";
import { updateSEO } from "../utils/seo";

export function SolucoesPage() {
  useEffect(() => {
    updateSEO({
      title: "Soluções Digitais | Obelisco Radical",
      description:
        "Vitrine de soluções digitais para profissionais de serviços. DOMOS: gestão de orçamentos, obras, agendamento e faturação.",
      canonical: "https://www.obeliscoradical.pt/solucoes",
      ogTitle: "Soluções Digitais",
      ogDescription:
        "Plataformas de gestão para simplificar operações e organizar o trabalho.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Soluções Digitais",
        url: "https://www.obeliscoradical.pt/solucoes",
        publisher: {
          "@type": "Organization",
          name: "Obelisco Radical",
        },
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

      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.18) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300"
          >
            ✨ Produtos digitais
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="electric-glow text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Tecnologia criada para{" "}
            <span className="block text-yellow-400">empresas reais</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl"
          >
            Soluções digitais desenvolvidas para simplificar a gestão, organizar
            operações e ajudar empresas a trabalhar melhor. Plataformas prontas para
            escalar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9"
          >
            <button
              onClick={() => {
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center rounded-2xl bg-yellow-400 px-8 py-4 text-base font-semibold text-zinc-950 transition hover:bg-yellow-300"
            >
              Conheça nossos produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

      {/* Products Grid */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Nossos <span className="text-yellow-400">Produtos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Soluções escaláveis para diferentes necessidades de negócio.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-7 transition duration-300 hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(250,204,21,0.08)]">
                <div className="mb-5">
                  <div className="text-3xl font-black text-yellow-400">
                    {product.name}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-zinc-400">
                    {product.tagline}
                  </div>
                </div>

                <p className="mt-3 flex-1 leading-7 text-zinc-400">
                  {product.description}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="text-sm font-semibold text-zinc-300">
                    Para: {product.audience}
                  </div>

                  <ul className="space-y-2">
                    {product.benefits.slice(0, 3).map((benefit, j) => (
                      <li key={j} className="flex gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    to={product.path}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
                  >
                    Saber mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
