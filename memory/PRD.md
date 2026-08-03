# PRD - Obelisco Radical Eletricidade

## Problema Original
Site de serviços elétricos com:
1. Checkout com carrinho de compras
2. Pagamento online exclusivo via Stripe
3. Planos de subscrição Obelisco Care (mensal e anual)
4. Sistema de emails de notificação
5. Portal do cliente completo
6. Assistente de IA para diagnóstico

## Estado Atual (28/03/2026)

### FUNCIONAL
- [x] Site completo com todas as secções
- [x] Carrinho de compras funcional
- [x] **Stripe como único gateway de pagamento**
- [x] **Secção Obelisco Care** com 3 planos
- [x] **Toggle Mensal/Anual** com desconto de 2 meses
- [x] **Portal do Cliente** (Área Cliente)
- [x] **Sistema de pedidos de intervenção**
- [x] Checkout com dados do cliente
- [x] Agendamento (Segunda a Sexta, 8h-18h)
- [x] Verificação de disponibilidade via app externo
- [x] Criação automática de pedidos no app de gestão
- [x] Assistente de IA funcional

### PLANOS OBELISCO CARE

| Plano | Mensal | Anual (2 meses grátis) | Horas/Mês |
|-------|--------|------------------------|-----------|
| **Essencial** | €349/mês | €3.490/ano (poupa €698) | 3h |
| **Preventivo** | €699/mês | €6.990/ano (poupa €1.398) | 6h |
| **Total** ⭐ | €1.290/mês | €12.900/ano (poupa €2.580) | 12h |

### PORTAL DO CLIENTE (Área Cliente)
- Login por email
- Ver subscrições activas
- Barra de progresso de horas usadas/disponíveis
- Pedir intervenção técnica
- Gerir pagamento via Stripe Portal
- Ver histórico de intervenções

### SISTEMA DE EMAILS
- **Email de boas-vindas** ao subscrever plano
- **Notificação ao admin** (obeliscoradical@gmail.com):
  - Nova subscrição
  - Nova compra
  - Novo pedido de intervenção

**NOTA:** RESEND_API_KEY está vazia no .env. Para ativar emails:
1. Criar conta em resend.com
2. Obter API key
3. Adicionar RESEND_API_KEY no .env

### ENDPOINTS STRIPE

**Pagamento Único**
- `POST /api/stripe/create-checkout-session`
- `GET /api/stripe/session/{session_id}`
- `POST /api/stripe/webhook`
- `GET /api/stripe/config`

**Subscrições**
- `POST /api/stripe/create-subscription-session`
- `GET /api/stripe/plans`

**Portal do Cliente**
- `GET /api/customer/subscriptions?email=`
- `GET /api/customer/subscription/{id}`
- `GET /api/customer/interventions?email=`
- `POST /api/customer/intervention`
- `POST /api/customer/portal-session`
- `GET /api/customer/payments?email=`

**Admin**
- `POST /api/admin/intervention/{id}/complete`

## URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Produção**: https://form-payments.emergent.host

## Testes
- Backend: 100% (34/34 testes)
- Frontend E2E: 100% (36/36 testes)

## Próximos Passos

### P1 - Para Ativar
1. Reclamar conta Stripe sandbox → produção
2. Configurar RESEND_API_KEY para emails
3. Configurar webhook: `https://form-payments.emergent.host/api/stripe/webhook`

### P2 - Melhorias Futuras
- Dashboard admin para ver todas as subscrições
- Histórico detalhado de intervenções
- Refatorar App.js (ficheiro grande)

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
- essencial_monthly/annual
- preventivo_monthly/annual
- total_monthly/annual
