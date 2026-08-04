# PRD - Obelisco Radical Eletricidade

## Problema Original
Site de serviços elétricos com:
1. Checkout com carrinho de compras
2. Pagamento online exclusivo via Stripe
3. Planos de subscrição Obelisco Care (mensal e anual)
4. Sistema de emails de notificação
5. Portal do cliente completo
6. Assistente de IA para diagnóstico
7. **Obelisco Connect** - Sistema unificado de gestão com PWA

## Estado Atual (04/08/2026)

### FUNCIONAL

#### Site Principal
- [x] Site completo com todas as secções
- [x] Carrinho de compras funcional
- [x] **Stripe como único gateway de pagamento**
- [x] **Secção Obelisco Care** com 3 planos
- [x] **Toggle Mensal/Anual** com desconto de 2 meses
- [x] **Portal do Cliente** (Área Cliente modal)
- [x] **Sistema de pedidos de intervenção**
- [x] Checkout com dados do cliente
- [x] Agendamento (Segunda a Sexta, 8h-18h)
- [x] Assistente de IA funcional

#### Obelisco Connect - Fase 1 (PWA & Auth) ✅
- [x] PWA instalável com manifest.json e service-worker
- [x] Página offline básica
- [x] Login unificado por roles (CUSTOMER, TECHNICIAN, ADMIN)
- [x] Login Cliente por email (subscrição ativa)
- [x] Login Equipa/Admin com email + password
- [x] Sessões com tokens seguros (7 dias)
- [x] Página /connect com toggle Cliente/Equipa

#### Obelisco Connect - Fase 2 (APIs Base) ✅
- [x] Modelos de dados: ServiceRequest, WorkLog, HoursAdjustment
- [x] Service Requests: criar, listar, atribuir técnico, agendar, status
- [x] Work Logs: criar (débito automático de horas), listar
- [x] Admin: listar técnicos, criar técnico, listar subscrições
- [x] Admin: ajuste manual de horas com histórico
- [x] Admin: dashboard com estatísticas
- [x] Customer Dashboard API: subscrição, horas, pedidos, work logs
- [x] Technician Dashboard API: pedidos atribuídos, stats, logs recentes

#### Obelisco Connect - Fase 3 (Dashboards Visuais) ✅
- [x] **Dashboard Cliente** (`/connect/client`)
  - Saldo de horas com barra de progresso
  - Criar novo pedido de serviço
  - Ver pedidos recentes e histórico
  - Detalhes da subscrição
  - Tabs: Resumo, Pedidos, Histórico, Conta
  - Navegação mobile com bottom nav
  
- [x] **Dashboard Admin** (`/connect/admin`)
  - Stats cards: subscrições ativas, pedidos pendentes, técnicos, trabalhos
  - Gestão completa de pedidos (atribuir, alterar status)
  - Gestão de técnicos (criar, listar)
  - Gestão de subscrições com ajuste manual de horas
  - Histórico de ajustes de horas
  - Tabs: Visão Geral, Pedidos, Técnicos, Subscrições, Ajustes

#### Obelisco Connect - Fase 4 (App Técnicos Migrado) ✅
- [x] **Dashboard Técnico** (`/connect/tech`)
  - Lista de trabalhos atribuídos com urgência e estado
  - Iniciar trabalho com **temporizador em tempo real**
  - **Checklist de serviço** (6 itens predefinidos)
  - **Upload de fotos** (até 10 fotos)
  - **Upload de vídeos** (até 3 vídeos)
  - **Assinatura digital do cliente** (canvas touch)
  - Navegação GPS para morada do cliente
  - Ligar diretamente para cliente
  - Submissão de work log com débito automático de horas
  - Tabs: Trabalhos, Histórico, Perfil
  
- [x] **Componente SignaturePad** reutilizável
  - Canvas de assinatura com touch support
  - Limpar/Cancelar/Confirmar
  - Export para base64 PNG

### PLANOS OBELISCO CARE

| Plano | Mensal | Anual (2 meses grátis) | Horas/Mês |
|-------|--------|------------------------|-----------|
| **Essencial** | €349/mês | €3.490/ano (poupa €698) | 3h |
| **Preventivo** | €699/mês | €6.990/ano (poupa €1.398) | 6h |
| **Total** ⭐ | €1.290/mês | €12.900/ano (poupa €2.580) | 12h |

### ROTAS OBELISCO CONNECT

| Rota | Componente | Acesso |
|------|------------|--------|
| `/connect` | ConnectLogin | Público |
| `/connect/client` | ConnectClientDashboard | CUSTOMER |
| `/connect/tech` | ConnectTechDashboard | TECHNICIAN |
| `/connect/admin` | ConnectAdminDashboard | ADMIN |

### URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Connect Login**: https://obelisco-payments.preview.emergentagent.com/connect
- **Client Dashboard**: https://obelisco-payments.preview.emergentagent.com/connect/client
- **Tech Dashboard**: https://obelisco-payments.preview.emergentagent.com/connect/tech
- **Admin Dashboard**: https://obelisco-payments.preview.emergentagent.com/connect/admin

## Próximos Passos

### P0 - Configuração de Produção
1. Reclamar conta Stripe sandbox → produção
2. Configurar RESEND_API_KEY para emails reais
3. Configurar webhook Stripe para confirmação de pagamentos

### P1 - Notificações Email
1. Email ao cliente quando pedido é criado
2. Email ao cliente quando pedido é atribuído
3. Email ao técnico quando recebe novo trabalho
4. Email ao admin para novos pedidos urgentes
5. Resumo diário de actividade para admin

### P2 - Funcionalidades Adicionais
1. Upload de fotos/vídeos para cloud storage (atual: base64 inline)
2. Relatórios mensais de consumo de horas
3. Exportar histórico de intervenções em PDF
4. Notificações push PWA
5. Modo offline para técnicos

## Contactos
- WhatsApp: +351 911 132 401
- Email: obeliscoradical@gmail.com
- Instagram: @obeliscoradical

## Notas Técnicas

### Cartão de Teste Stripe
- Número: 4242 4242 4242 4242
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos

### Arquitetura
```
/app
├── backend/
│   ├── server.py      # FastAPI (2280+ linhas)
│   └── .env           # MONGO_URL, Stripe, Resend, LLM keys
├── frontend/
│   ├── src/
│   │   ├── App.js     # Site principal + routing condicional
│   │   ├── index.js   # BrowserRouter wrapper
│   │   ├── pages/
│   │   │   ├── ConnectLogin.js
│   │   │   ├── ConnectClientDashboard.js
│   │   │   ├── ConnectTechDashboard.js
│   │   │   └── ConnectAdminDashboard.js
│   │   └── components/
│   │       ├── SignaturePad.js
│   │       ├── ElectricalAssistant.js
│   │       └── PWAInstallBanner.js
│   └── public/
│       ├── manifest.json
│       └── service-worker.js
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

### Work Log Fields (Fase 4)
```javascript
{
  service_request_id: string,
  hours_spent: number,
  work_description: string,
  notes: string,
  photos: string[],    // base64 encoded
  videos: string[],    // base64 encoded
  signature: string,   // base64 encoded
  checklist: [{id, text, checked}]
}
```
