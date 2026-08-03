# PRD - Obelisco Radical Eletricidade

## Problema Original
Site de serviços elétricos com:
1. Checkout com carrinho de compras
2. Pagamento online exclusivo via Stripe
3. Planos de subscrição mensal Obelisco Care
4. Assistente de IA para diagnóstico

## Estado Atual (28/03/2026)

### FUNCIONAL
- [x] Site completo com todas as secções
- [x] Carrinho de compras funcional
- [x] **Stripe como único gateway de pagamento** (Cartão de Crédito/Débito)
- [x] **Secção Obelisco Care** com 3 planos de subscrição
- [x] Checkout com dados do cliente
- [x] Agendamento (Segunda a Sexta, 8h-18h)
- [x] Verificação de disponibilidade via app externo
- [x] Criação automática de pedidos no app de gestão
- [x] Assistente de IA funcional
- [x] Google Calendar conectado

### PLANOS OBELISCO CARE (Subscrição Mensal)

| Plano | Preço | Horas/Mês | Resposta |
|-------|-------|-----------|----------|
| **Essencial** | €349/mês | 3h | 48h úteis |
| **Preventivo** | €699/mês | 6h | 24h úteis |
| **Total** ⭐ | €1.290/mês | 12h | 8h úteis |

- Sem fidelização - cancelamento a qualquer momento
- Pagamento mensal recorrente via Stripe

### ENDPOINTS STRIPE

**Pagamento Único (Serviços)**
- `POST /api/stripe/create-checkout-session` - Checkout único
- `GET /api/stripe/session/{session_id}` - Status do pagamento
- `POST /api/stripe/webhook` - Webhooks Stripe
- `GET /api/stripe/config` - Chave pública Stripe

**Subscrições (Planos)**
- `POST /api/stripe/create-subscription-session` - Checkout subscrição
- `GET /api/stripe/plans` - Lista de planos disponíveis

## URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Produção**: https://form-payments.emergent.host

## Testes
- Backend: 100% passaram
- Frontend E2E: 100% passaram (26 specs)
- Specs criados/atualizados:
  - `/app/tests/e2e/obelisco-care.spec.ts`
  - `/app/tests/e2e/payment-methods.spec.ts`
  - `/app/tests/e2e/golden-path.spec.ts`
  - `/app/tests/e2e/core-flows.spec.ts`

## Próximos Passos

### P1 - Para Ativar Pagamentos Reais
1. Reclamar a conta Stripe sandbox para produção
2. Completar verificação KYC no Stripe
3. Configurar webhook: `https://form-payments.emergent.host/api/stripe/webhook`

### P2 - Melhorias Futuras
- Refatorar App.js (ficheiro monolítico)
- Notificações por email após pagamento
- Dashboard de gestão de subscrições

## Contactos
- WhatsApp: +351 911 132 401
- Email: obeliscoradical@gmail.com
- Instagram: @obeliscoradical

## Notas Técnicas

### Cartão de Teste
- Número: 4242 4242 4242 4242
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos

### Stripe Products
- essencial_monthly: €349/mês
- preventivo_monthly: €699/mês  
- total_monthly: €1.290/mês
