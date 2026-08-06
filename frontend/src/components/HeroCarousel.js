import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';

// Hero carousel slides data
const heroSlides = [
  {
    id: 1,
    badge: "Infraestruturas & Energia",
    title: "Engenharia Elétrica & Telecomunicações",
    titleHighlight: "de Elevada Exigência",
    subtitle: "Soluções técnicas integradas com rigor, precisão e total conformidade com normas europeias.",
    ctaPrimary: { text: "Solicitar Proposta Técnica", href: "#contacto" },
    ctaSecondary: { text: "Ver Projetos", href: "#services" },
    image: "https://static.prod-images.emergentagent.com/jobs/cbda47ad-351b-4c1c-8f47-fda2fc28d16b/images/65464781b05bd7e6f2abd97b5768d25d4d288a5d81f7639c398380dedca52d0a.jpeg"
  },
  {
    id: 2,
    badge: "Tecnologia Proprietária",
    title: "Gestão Inteligente & Monitorização",
    titleHighlight: "Técnica em Tempo Real",
    subtitle: "Plataforma digital avançada para controlo de métricas, eficiência operacional e suporte contínuo.",
    ctaPrimary: { text: "Conhecer a Plataforma", href: "#obelisco-care" },
    ctaSecondary: { text: "Funcionalidades", href: "#obelisco-care" },
    image: "https://static.prod-images.emergentagent.com/jobs/cbda47ad-351b-4c1c-8f47-fda2fc28d16b/images/30167e4be89a885c02d8505bfbd72ed989a70dfe0642b04e5f0a388acaa84234.jpeg"
  },
  {
    id: 3,
    badge: "Capacidade Operacional",
    title: "Intervenção Técnica Especializada",
    titleHighlight: "no Terreno",
    subtitle: "Equipas qualificadas e frota equipada para prestar assistência rápida e eficaz em toda a Grande Lisboa.",
    ctaPrimary: { text: "Falar com Especialista", href: "#contacto" },
    ctaSecondary: null,
    image: "https://static.prod-images.emergentagent.com/jobs/cbda47ad-351b-4c1c-8f47-fda2fc28d16b/images/f48656e92863ef50685aa03d67593ca5c910c6cbfc050edb6365dab7e380d220.jpeg"
  },
  {
    id: 4,
    badge: "Qualidade & Segurança",
    title: "Padrões Industriais de",
    titleHighlight: "Alta Performance",
    subtitle: "Compromisso com a segurança, fiabilidade dos materiais e execução sem falhas.",
    ctaPrimary: { text: "As Nossas Certificações", href: "#sobre" },
    ctaSecondary: null,
    image: "https://static.prod-images.emergentagent.com/jobs/cbda47ad-351b-4c1c-8f47-fda2fc28d16b/images/81be639ccd071eaacfda1f87c7d723f239f9990de4a507d100fc8fa8c2574e34.jpeg"
  }
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

const HeroCarousel = ({ scrollToSection }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(current => (current + 1) % heroSlides.length);
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPaused, currentSlide]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setProgress(0);
  }, []);

  const handleCTAClick = useCallback((href) => {
    if (href.startsWith('#')) {
      const sectionId = href.substring(1);
      if (scrollToSection) {
        scrollToSection(sectionId);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [scrollToSection]);

  const currentData = heroSlides[currentSlide];

  return (
    <section
      id="hero"
      className="relative h-[600px] md:h-[650px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="hero-carousel"
    >
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentData.image})` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-400/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold uppercase tracking-wider text-yellow-400">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    {currentData.badge}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white"
                >
                  {currentData.title}{' '}
                  <span className="text-yellow-400">{currentData.titleHighlight}</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl"
                >
                  {currentData.subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <button
                    onClick={() => handleCTAClick(currentData.ctaPrimary.href)}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold uppercase tracking-wide text-slate-950 transition-all duration-300 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/25"
                    data-testid="hero-cta-primary"
                  >
                    {currentData.ctaPrimary.text}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>

                  {currentData.ctaSecondary && (
                    <button
                      onClick={() => handleCTAClick(currentData.ctaSecondary.href)}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-900/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-yellow-500/50 hover:bg-zinc-800/50"
                      data-testid="hero-cta-secondary"
                    >
                      {currentData.ctaSecondary.text}
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Bars Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className="group relative h-1 w-16 sm:w-24 rounded-full bg-white/20 overflow-hidden transition-all hover:bg-white/30"
            aria-label={`Ir para slide ${index + 1}`}
            data-testid={`hero-progress-${index}`}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-100"
              style={{
                width: index === currentSlide ? `${progress}%` : index < currentSlide ? '100%' : '0%'
              }}
            />
            {/* Hover indicator */}
            <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/30 transition-colors" />
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-400">
        <span className="text-yellow-400 text-lg font-bold">0{currentSlide + 1}</span>
        <span>/</span>
        <span>0{heroSlides.length}</span>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-400/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroCarousel;
