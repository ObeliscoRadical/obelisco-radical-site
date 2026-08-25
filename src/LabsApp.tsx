import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";

export default function LabsApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  const products = [
    {
      id: "domos",
      name: "DOMOS",
      icon: "🔷",
      category: "GESTÃO EMPRESARIAL",
      tagline: "A gestão que se adapta à sua profissão.",
      description: "Plataforma de gestão completa para empresas e profissionais.",
      features: [
        "Clientes, orçamentos e serviços",
        "Obras, equipas e agenda",
        "Relatórios e indicadores",
      ],
      cta: "CONECTAR DOMOS",
      disabled: false,
    },
    {
      id: "fluxos",
      name: "FLUXOS",
      icon: "🔷",
      category: "AUTOMAÇÃO",
      tagline: "Automatize processos, ganhe eficiência.",
      description: "Automação de fluxos de trabalho inteligentes.",
      features: [
        "Fluxos de trabalho inteligentes",
        "Aprovações e notificações",
        "Integrações com tuas ferramentas",
      ],
      cta: "EM BREVE",
      disabled: true,
    },
    {
      id: "tracker",
      name: "TRACKER",
      icon: "🔷",
      category: "MONITORIZAÇÃO",
      tagline: "Monitore o que importa em tempo real.",
      description: "Dashboard em tempo real para acompanhar KPIs.",
      features: [
        "Indicadores em tempo real",
        "Alertas e eventos",
        "Dashboards personalizados",
      ],
      cta: "EM BREVE",
      disabled: true,
    },
    {
      id: "embreve",
      name: "EM BREVE",
      icon: "🔷",
      category: "INOVAÇÃO",
      tagline: "Novas soluções estão chegando.",
      description: "Estamos desenvolvendo novas ferramentas.",
      features: [
        "Mais soluções em desenvolvimento",
        "Roadmap publicado em breve",
        "Participe do programa beta",
      ],
      cta: "SAIBA MAIS",
      disabled: true,
    },
  ];

  const benefits = [
    { icon: "🛡️", title: "Soluções completas", desc: "Tudo o que sua empresa precisa em um só lugar." },
    { icon: "📈", title: "Foco em resultados", desc: "Mais produtividade, menos complicações." },
    { icon: "😊", title: "Fácil de usar", desc: "Interfaces intuitivas para dia a dia real." },
    { icon: "🔒", title: "Segurança de dados", desc: "Proteção avançada para suas informações." },
    { icon: "👥", title: "Suporte especializado", desc: "Estamos com você em cada etapa." },
  ];

  const personas = [
    { icon: "🏢", title: "Pequenos negócios", desc: "Organize, controle e cresça com eficiência." },
    { icon: "📊", title: "Empresas em crescimento", desc: "Estruture processos e ganhe escala." },
    { icon: "👷", title: "Equipas técnicas", desc: "Gestão completa das operações no terreno." },
    { icon: "💼", title: "Gestores e empreendedores", desc: "Informação clara para melhores decisões." },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        html { scroll-behavior: smooth; }
        body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        h1,h2,h3,h4,h5,h6 { font-family: Oswald, Inter, sans-serif; }
      `}</style>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-black font-black">⬡</div>
            <div>
              <div className="text-xl font-black">OBELISCO</div>
              <div className="text-xs font-bold text-amber-400">LABS</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {["PRODUTOS", "SOLUÇÕES", "PARA QUEM É", "PLANOS", "SOBRE NÓS", "CONTACTO"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-300 transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 md:block">
              ENTRAR
            </button>
            <button className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-300">
              COMEÇAR AGORA
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-slate-700 p-2 text-slate-300 md:hidden">
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-800 bg-black px-4 py-4 md:hidden">
            <div className="space-y-3">
              {["PRODUTOS", "SOLUÇÕES", "PARA QUEM É", "PLANOS", "SOBRE NÓS", "CONTACTO"].map((item) => (
                <a key={item} href="#" className="block text-sm font-medium text-slate-300 hover:text-white">
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
                <span className="text-sm font-medium text-purple-300">OBELISCO LABS</span>
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                TECNOLOGIA QUE<br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  TRANSFORMA GESTÃO
                </span>
                <br />
                <span className="text-amber-400">EM RESULTADOS.</span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300 lg:text-xl">
                Desenvolvemos aplicações e soluções digitais para simplificar o dia a dia de empresas e impulsionar o crescimento.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 font-bold uppercase tracking-wider text-white transition hover:from-purple-500 hover:to-purple-400">
                  CONECTA NOSSOS PRODUTOS <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="rounded-lg border border-slate-700 px-8 py-4 font-bold uppercase tracking-wider text-white transition hover:bg-slate-900">
                  VER SOLUÇÕES
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-48 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 opacity-50" />
                  <div className="h-32 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 opacity-50" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-slate-800 bg-slate-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-5">
            {benefits.map((benefit, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center">
                <div className="mb-4 text-4xl">{benefit.icon}</div>
                <h3 className="font-bold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-bold uppercase text-purple-400">NOSSOS PRODUTOS</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Soluções criadas para<br />empresas que querem ir mais longe.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`flex flex-col rounded-2xl border p-6 transition ${product.disabled ? "border-slate-800 bg-slate-950" : "border-slate-700 bg-slate-900 hover:border-purple-500/40"}`}>
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-2xl font-black text-white">{product.name}</h3>
                <div className="mt-2 text-xs font-bold uppercase text-purple-400">{product.category}</div>
                <p className="mt-3 font-semibold text-slate-300">{product.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{product.description}</p>
                <ul className="mt-6 space-y-2">
                  {product.features.map((feat, j) => (
                    <li key={j} className="flex gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button disabled={product.disabled} className={`mt-6 rounded-lg px-4 py-3 text-sm font-bold uppercase transition w-full ${product.disabled ? "border border-slate-700 text-slate-500 cursor-not-allowed" : "border border-purple-500/50 text-purple-300 hover:bg-purple-500/10"}`}>
                  {product.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="border-y border-slate-800 bg-slate-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-bold uppercase text-purple-400">PARA QUEM É</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Tecnologia para diferentes desafios,<br />o mesmo objetivo: fazer seu negócio crescer.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
                <div className="text-4xl mb-4">{persona.icon}</div>
                <h3 className="font-bold text-white">{persona.title}</h3>
                <p className="mt-3 text-sm text-slate-400">{persona.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-12 text-center backdrop-blur-sm">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
              <Rocket className="h-8 w-8 text-purple-400" />
            </div>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Pronto para transformar a gestão<br />
              <span className="text-amber-400">da sua empresa?</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              Descubra o poder das nossas soluções. Comece hoje.
            </p>

            <div className="mt-10 flex flex-col gap-4 justify-center sm:flex-row">
              <button className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 font-bold uppercase tracking-wider text-white transition hover:from-purple-500 hover:to-purple-400">
                COMEÇAR AGORA <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="rounded-lg border border-slate-700 px-8 py-4 font-bold uppercase tracking-wider text-white transition hover:bg-slate-900">
                Falar com especialista
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <a href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black font-black text-sm">⬡</div>
                <div>
                  <div className="font-black text-sm">OBELISCO</div>
                  <div className="text-xs font-bold text-amber-400">LABS</div>
                </div>
              </a>
              <p className="text-sm text-slate-400">Produtos e soluções digitais</p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">OBELISCO LABS</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Produtos</a></li>
                <li><a href="#" className="hover:text-white">Soluções</a></li>
                <li><a href="#" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Termos de utilização</a></li>
                <li><a href="#" className="hover:text-white">Política de privacidade</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">VAMOS CONVERSAR?</h3>
              <p className="text-sm text-slate-400 mb-4">Fale connosco no WhatsApp</p>
              <a href="https://wa.me/351911132401" className="w-full inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 font-bold text-white transition hover:bg-green-400">
                ABRIR WHATSAPP
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2025 Obelisco Labs. Todos os direitos reservados. | Uma divisão de Obelisco Radical.</p>
            <p className="mt-2"><a href="/" className="hover:text-slate-300">← Voltar ao Obelisco Radical</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
