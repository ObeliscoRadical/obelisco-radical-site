import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Bell, Zap } from 'lucide-react';
import { initPWAInstallPrompt, promptPWAInstall, isPWAInstalled, isMobileDevice } from '../utils/pwa';

export function PWAInstallBanner() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Don't show if already installed
    if (isPWAInstalled()) {
      return;
    }

    // Initialize install prompt
    initPWAInstallPrompt(setCanInstall);

    // Show banner after a delay (mobile gets it faster)
    const delay = isMobileDevice() ? 2000 : 5000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setIsVisible(false);
      setDismissed(true);
      sessionStorage.setItem('pwa-banner-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if dismissed
  if (dismissed || !isVisible) {
    return null;
  }

  const isMobile = isMobileDevice();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom"
          data-testid="pwa-install-banner"
        >
          <div className="mx-auto max-w-lg rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-5 shadow-2xl shadow-yellow-500/10">
            {/* Header with icon and close button */}
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/30">
                  <Zap className="h-7 w-7 text-zinc-900" />
                </div>
                {/* Notification badge */}
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-lg">
                  <Bell className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">
                  Instale o Obelisco Connect
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  {isMobile 
                    ? "Adicione ao ecrã principal do seu telemóvel para acesso mais rápido e receba notificações em tempo real!"
                    : "Instale a aplicação no seu computador para acesso direto e receba notificações instantâneas sobre pedidos e trabalhos."
                  }
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Fechar"
                data-testid="pwa-banner-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Features */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                <Smartphone className="h-3.5 w-3.5 text-yellow-400" />
                Acesso rápido
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                <Bell className="h-3.5 w-3.5 text-yellow-400" />
                Notificações
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                Funciona offline
              </span>
            </div>
            
            {/* Action buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                data-testid="pwa-banner-dismiss"
              >
                Mais tarde
              </button>
              
              {canInstall ? (
                <button
                  onClick={handleInstall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-bold text-zinc-900 shadow-lg shadow-yellow-500/30 transition-all hover:from-yellow-300 hover:to-yellow-400 hover:shadow-yellow-500/40"
                  data-testid="pwa-banner-install"
                >
                  <Download className="h-4 w-4" />
                  Instalar Agora
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-bold text-zinc-900 shadow-lg shadow-yellow-500/30 transition-all hover:from-yellow-300 hover:to-yellow-400"
                  data-testid="pwa-banner-ok"
                >
                  Entendi
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWAInstallBanner;
