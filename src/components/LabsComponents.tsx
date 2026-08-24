import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react";

export function LabsHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-950/40 via-blue-950/20 to-transparent">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2"
        >
          <div className="px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10">
            <span className="text-sm font-medium text-violet-300">
              Obelisco Labs
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-tight tracking-tight text-white"
        >
          TECNOLOGIA QUE
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            TRANSFORMA GESTÃO
          </span>
          <span className="block text-yellow-400">EM RESULTADOS.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 max-w-3xl text-xl leading-relaxed text-zinc-200 sm:text-2xl"
        >
          Criamos aplicações e soluções digitais para simplificar o dia a dia de
          empresas, organizar operações e ajudar negócios a crescer.
          <span className="block mt-4 text-zinc-300">
            Do serviço técnico à inovação digital.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <button className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-5 text-lg font-black uppercase tracking-wide text-white transition hover:from-violet-500 hover:to-purple-500 shadow-2xl shadow-violet-500/20">
            Conheça nossos produtos
            <ArrowRight className="ml-3 h-5 w-5" />
          </button>

          <button className="inline-flex items-center justify-center rounded-2xl border-2 border-violet-500/50 px-8 py-5 text-lg font-bold text-white transition hover:bg-violet-500/10">
            Ver soluções
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid gap-6 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur p-6">
            <div className="text-3xl font-black text-violet-400">Soluções</div>
            <div className="mt-2 text-sm text-zinc-400">
              Focadas em resultados reais
            </div>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur p-6">
            <div className="text-3xl font-black text-blue-400">Equipes</div>
            <div className="mt-2 text-sm text-zinc-400">
              Suporte especializado sempre
            </div>
          </div>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur p-6">
            <div className="text-3xl font-black text-yellow-400">Confiança</div>
            <div className="mt-2 text-sm text-zinc-400">
              Empresas confiam em nós
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LabsBenefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Simples de usar",
      desc: "Interfaces intuitivas pensadas para quem trabalha",
    },
    {
      icon: TrendingUp,
      title: "Foco em resultados",
      desc: "Funcionalidades que realmente impactam seu negócio",
    },
    {
      icon: Shield,
      title: "Segurança garantida",
      desc: "Dados protegidos com tecnologia enterprise",
    },
    {
      icon: Users,
      title: "Suporte especializado",
      desc: "Equipe sempre disponível para ajudar",
    },
  ];

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tight text-white">
            Por que escolher
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Obelisco Labs
            </span>
          </h2>
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
                className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-blue-500/5 p-8 backdrop-blur hover:border-violet-500/40 transition"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600/20 to-blue-600/20">
                  <Icon className="h-7 w-7 text-violet-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
