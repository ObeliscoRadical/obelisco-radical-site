// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Registration successful:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  console.log('[SW] New content available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('[SW] Registration failed:', error);
        });
    });
  }
}

// PWA Install Prompt Handler
let deferredPrompt = null;

export function initPWAInstallPrompt(setCanInstall) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser prompt
    e.preventDefault();
    // Store event for later use
    deferredPrompt = e;
    // Update UI to show install button
    setCanInstall(true);
    console.log('[PWA] Install prompt ready');
  });

  // Handle successful install
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setCanInstall(false);
    console.log('[PWA] App installed');
  });
}

export async function promptPWAInstall() {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] User choice:', outcome);
  
  // Clear the prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

// Check if app is running as PWA
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Check if device is mobile
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
