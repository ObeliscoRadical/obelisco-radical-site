import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
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

    // Show banner after a delay on mobile
    if (isMobileDevice()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Only show on mobile and when install is available
  if (!isMobileDevice() || dismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom"
        >
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-400">
                <Smartphone className="h-6 w-6 text-zinc-900" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">Instalar Obelisco Connect</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Adicione ao seu telemovel para acesso rapido e offline.
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Agora nao
              </button>
              
              {canInstall ? (
                <button
                  onClick={handleInstall}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-yellow-300"
                >
                  <Download className="h-4 w-4" />
                  Instalar
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-yellow-300"
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
