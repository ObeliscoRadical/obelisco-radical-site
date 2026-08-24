/**
 * Catálogo de produtos digitais escalável.
 * Cada produto é um card na vitrine /solucoes
 * com landing dedicada /domos, /jarvis, etc.
 */

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  audience: string;
  benefits: string[];
  logo?: string; // URL ou import
  path: string; // /domos, /jarvis, etc.
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "domos",
    name: "DOMOS",
    tagline: "A gestão que se adapta à sua profissão.",
    description:
      "Plataforma de gestão técnica para profissionais de serviços (eletricidade, canalização, AVAC, CCTV, telecomunicações, solar, manutenção). Orçamentos, obras, agendamento, faturação — tudo integrado.",
    audience: "Profissionais de serviços técnicos e empresas de manutenção",
    benefits: [
      "Gestão de orçamentos e obras por cliente",
      "Agendamento integrado e automático",
      "Faturação e gestão de receitas",
      "Portal do cliente em tempo real",
      "Relatórios e análise de negócio",
    ],
    path: "/domos",
    featured: true,
  },
];
