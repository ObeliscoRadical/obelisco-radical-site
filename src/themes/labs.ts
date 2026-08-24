/**
 * Design system para Obelisco Labs
 * Tema tecnológico: preto/navy profundo + azul/violeta + amarelo/dourado
 */

export const labsTheme = {
  colors: {
    bg: {
      primary: "#0a0e27", // Navy profundo (background)
      secondary: "#0f1535", // Ligeiramente mais claro
      tertiary: "#1a1f3a", // Cards/sections
    },
    accent: {
      primary: "#7c3aed", // Violeta/roxo
      secondary: "#6366f1", // Azul índigo
      highlight: "#fbbf24", // Amarelo (mantém DNA Obelisco)
    },
    text: {
      primary: "#ffffff",
      secondary: "#e5e7eb",
      muted: "#9ca3af",
    },
    border: {
      light: "#374151",
      dark: "#1f2937",
    },
  },
  gradient: {
    hero: "from-purple-900/20 via-blue-900/10 to-indigo-900/20",
    accent: "from-violet-600 to-purple-600",
  },
};

export const designSystem = {
  spacing: "grid-cols", // Reutiliza Tailwind
  radius: "rounded-2xl", // Preserva
  motion: "framer-motion", // Preserva
  typography: "Oswald/Inter", // Preserva
};
