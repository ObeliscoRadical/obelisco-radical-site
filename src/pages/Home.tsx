import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ObeliscoRadicalSite from "../App";
import { updateSEO } from "../utils/seo";

export function HomePage() {
  useEffect(() => {
    updateSEO({
      title: "Obelisco Radical | Eletricidade Profissional & Soluções Digitais",
      description:
        "Serviços elétricos profissionais em Lisboa + plataforma DOMOS para gestão técnica. Orçamentos, obras, agendamento integrado.",
      canonical: "https://www.obeliscoradical.pt/",
      ogTitle: "Obelisco Radical",
      ogDescription:
        "Eletricidade profissional + DOMOS, plataforma de gestão para técnicos e empresas.",
    });
  }, []);

  return (
    <div>
      {/* Home tradicional (App.tsx renderizado) + teaser Soluções */}
      <ObeliscoRadicalSite />

      {/* Teaser Soluções Digitais antes do footer */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 sm:p-12 shadow-2xl shadow-yellow-500/10"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300">
                ✨ Novo
              </div>

              <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
                Soluções <span className="text-yellow-400">Digitais</span>
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
                Tecnologia criada para empresas reais. Plataformas de gestão que
                simplificam operações, organizam dados e ajudam profissionais a
                trabalhar melhor.
              </p>

              <p className="mt-4 leading-7 text-zinc-400">
                Desde DOMOS, plataforma de gestão para técnicos de eletricidade,
                canalização, AVAC, telecomunicações e manutenção.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/solucoes"
                  className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-4 text-base font-semibold text-zinc-950 transition hover:bg-yellow-300"
                >
                  Conheça nossos produtos
                </Link>

                <Link
                  to="/domos"
                  className="inline-flex items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-8 py-4 text-base font-semibold text-yellow-300 transition hover:bg-yellow-400/10"
                >
                  Descubra o DOMOS
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-yellow-400 sm:text-7xl">
                  DOMOS
                </div>
                <p className="mt-3 text-lg font-semibold text-zinc-300">
                  A gestão que se adapta à sua profissão
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
