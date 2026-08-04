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
- [x] **Portal do Cliente** (Área Cliente)
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
- [x] Customer Dashboard: subscrição, horas, pedidos, work logs
- [x] Technician Dashboard: pedidos atribuídos, stats, logs recentes
- [x] Débito automático de horas ao submeter work log

### PLANOS OBELISCO CARE

| Plano | Mensal | Anual (2 meses grátis) | Horas/Mês |
|-------|--------|------------------------|-----------|
| **Essencial** | €349/mês | €3.490/ano (poupa €698) | 3h |
| **Preventivo** | €699/mês | €6.990/ano (poupa €1.398) | 6h |
| **Total** ⭐ | €1.290/mês | €12.900/ano (poupa €2.580) | 12h |

### ENDPOINTS OBELISCO CONNECT

**Auth**
- `POST /api/connect/login/customer` - Login cliente (email)
- `POST /api/connect/login/staff` - Login equipa (email + password)
- `GET /api/connect/me` - Utilizador atual
- `POST /api/connect/logout` - Terminar sessão

**Service Requests**
- `POST /api/connect/service-requests` - Criar pedido
- `GET /api/connect/service-requests` - Listar pedidos
- `GET /api/connect/service-requests/{id}` - Ver pedido
- `PUT /api/connect/service-requests/{id}/assign` - Atribuir técnico
- `PUT /api/connect/service-requests/{id}/schedule` - Agendar
- `PUT /api/connect/service-requests/{id}/status` - Atualizar status

**Work Logs**
- `POST /api/connect/work-logs` - Criar work log (débito horas)
- `GET /api/connect/work-logs` - Listar work logs

**Admin**
- `GET /api/connect/admin/technicians` - Listar técnicos
- `POST /api/connect/admin/technicians` - Criar técnico
- `GET /api/connect/admin/subscriptions` - Listar subscrições
- `POST /api/connect/admin/hours-adjustment` - Ajustar horas
- `GET /api/connect/admin/hours-adjustments` - Histórico ajustes
- `GET /api/connect/admin/stats` - Estatísticas

**Dashboards**
- `GET /api/connect/customer/dashboard` - Dashboard cliente
- `GET /api/connect/technician/dashboard` - Dashboard técnico

## URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Connect**: https://obelisco-payments.preview.emergentagent.com/connect

## Testes (iteration 7)
- Backend: 100% (82/82 testes)
- Frontend E2E: 100% (23/23 testes)
- Regressão: 100% (105/105 testes)

## Próximos Passos

### P0 - Fase 3: Dashboards Completos (Próximo)
1. Dashboard Cliente completo em /connect/client
2. Dashboard Técnico em /connect/tech
3. Dashboard Admin em /connect/admin
4. **Migrar UI do app Obelisco-Tecnicos** (zip fornecido)

### P1 - Fase 4: Work Logs Avançados
1. Checklist de serviço
2. Temporizador de tempo de serviço
3. Upload de fotos/vídeos
4. **Assinatura digital do cliente**
5. Débito de horas em tempo real

### P2 - Ativação Produção
1. Reclamar conta Stripe sandbox → produção
2. Configurar RESEND_API_KEY para emails
3. Configurar webhook Stripe

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
│   ├── server.py      # FastAPI (2271 linhas)
│   └── .env           # MONGO_URL, Stripe, Resend, LLM keys
├── frontend/
│   ├── src/
│   │   ├── App.js     # Site principal (monolítico)
│   │   └── pages/ConnectLogin.js
│   └── public/
│       ├── manifest.json
│       └── service-worker.js
└── memory/
    ├── PRD.md
    └── test_credentials.md
```
