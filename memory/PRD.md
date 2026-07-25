# PRD - Obelisco Radical Eletricidade

## Problema Original
Site de serviços elétricos com:
1. Checkout integrado com app de gestão de pedidos
2. Pagamento online real com Stripe (Cartão de Crédito/Débito)
3. Assistente de IA para diagnóstico
4. Integração com Google Calendar para evitar agendamentos duplicados

## Estado Atual (28/03/2026)

### FUNCIONAL
- [x] Site completo com todas as secções
- [x] Carrinho de compras
- [x] Checkout com dados do cliente
- [x] **Tipo de Serviço** (Instalação, Reparação, Manutenção, Visita Técnica, Certificação)
- [x] **Agendamento** (Segunda a Sexta, 8h-18h, com validação de fins de semana e dia atual)
- [x] **Google Calendar conectado** (obeliscoradical@gmail.com)
- [x] **Verificação de disponibilidade** via app externo
- [x] **Criação automática de pedidos** no app de gestão
- [x] Assistente de IA funcional
- [x] **Stripe Checkout** - Pagamento com cartão de crédito/débito
- [x] **Transferência Bancária** - IBAN disponível
- [x] **WhatsApp fallback** - salva pedido no app

### INTEGRAÇÃO STRIPE IMPLEMENTADA
- Sandbox Stripe provisionado com chaves de teste
- Endpoints criados:
  - `POST /api/stripe/create-checkout-session`
  - `GET /api/stripe/session/{session_id}`
  - `POST /api/stripe/webhook`
  - `GET /api/stripe/config`
- Frontend atualizado com novo modal de pagamento
- Fluxo: Redirect para Stripe Checkout → Retorno com confirmação

### MÉTODOS DE PAGAMENTO DISPONÍVEIS
1. **Cartão de Crédito/Débito** (via Stripe) - Visa, Mastercard, American Express
2. **Transferência Bancária** (IBAN BPI)
3. **WhatsApp** (combinar pagamento directamente)

## URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Produção**: https://obeliscoradical.pt

## Integrações Configuradas

### Stripe (Pagamentos) - NOVO
- Account ID: acct_1TxBkOERmwXcLQe4
- Mode: Test (Sandbox claimable)
- Onboarding URL disponível para ativar conta live
- Webhook: /api/stripe/webhook

### Google Calendar
- Client ID: 223328608522-tpfta8u5miid6pvnhfi3on52upsih989.apps.googleusercontent.com
- Email conectado: obeliscoradical@gmail.com
- Funcionalidades:
  - Verificar disponibilidade de horários
  - Criar eventos automaticamente (via app de gestão)

### App de Gestão
- URL: https://tech-app-obelisco.emergent.host
- Endpoints:
  - `POST /api/orders/public` - Criar pedido
  - `POST /api/orders/check-availability` - Verificar disponibilidade

## Fluxo de Pedido

1. Cliente adiciona serviços ao carrinho
2. Preenche dados (nome, email, telefone, morada)
3. Seleciona **Tipo de Serviço**
4. Seleciona **Data** (apenas dias úteis, a partir de amanhã)
5. Seleciona **Hora** (horários ocupados desactivados)
6. Clica "Pagar com Cartão"
7. Modal de escolha de pagamento:
   - **Cartão** → Redirect para Stripe Checkout
   - **Transferência** → Mostra IBAN
   - **WhatsApp** → Salva pedido e abre WhatsApp
8. Após pagamento confirmado → Pedido criado no app de gestão

## Testes
- Backend: 18/18 testes passaram (100%)
- Frontend: 24/24 testes E2E passaram (100%)
- Specs criados em `/app/tests/e2e/`
- Testes backend em `/app/backend/tests/`

## Próximos Passos

### P1 - Para Ativar Pagamentos Reais
1. Aceder ao link de onboarding Stripe para reclamar a conta sandbox
2. Completar verificação KYC no Stripe
3. Após aprovação, as chaves mudam automaticamente para produção
4. Configurar webhook no Stripe Dashboard: `https://obeliscoradical.pt/api/stripe/webhook`

### P2 - Melhorias Futuras
- Refatorar App.js (ficheiro muito grande com +2000 linhas)
- Adicionar notificações por email após pagamento
- Dashboard de pedidos para o administrador

## Contactos
- WhatsApp: +351 911 132 401
- Email: obeliscoradical@gmail.com
- Instagram: @obeliscoradical

## Notas Técnicas

### Modo de Taxas Stripe
O modo de impostos atual é **DIY** (sem cálculo automático de taxas pelo Stripe).
Opções disponíveis:
- Stripe calcula impostos (+0.5% por transação)
- DIY - Stripe processa pagamento sem ajuda com impostos

### Cartão de Teste
- Número: 4242 4242 4242 4242
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos
