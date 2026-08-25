import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LabsApp from './LabsApp.tsx'

export function Router() {
  // Detecta se está em /labs ou #/labs
  const isLabs = useMemo(() => {
    const path = window.location.pathname + window.location.hash;
    return path.includes('/labs') || path.includes('#/labs');
  }, []);

  return isLabs ? <LabsApp /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)

// Listener para mudanças de rota (SPA navigation)
window.addEventListener('hashchange', () => {
  window.location.reload();
});

window.addEventListener('popstate', () => {
  window.location.reload();
});
