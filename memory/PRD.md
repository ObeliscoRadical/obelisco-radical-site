# PRD - Obelisco Radical Eletricidade

## Problema Original
Site de serviços elétricos com:
1. Checkout integrado com app de gestão de pedidos
2. Pagamento online real com Easypay (Cartão, MB Way, Multibanco)
3. Assistente de IA para diagnóstico
4. Integração com Google Calendar para evitar agendamentos duplicados

## Estado Atual (22/03/2026)

### FUNCIONAL
- [x] Site completo com todas as secções
- [x] Carrinho de compras
- [x] Checkout com dados do cliente
- [x] **Tipo de Serviço** (Instalação, Reparação, Manutenção, Visita Técnica, Certificação)
- [x] **Agendamento** (Segunda a Sexta, 9h-18h, com validação de fins de semana)
- [x] **Google Calendar conectado** (obeliscoradical@gmail.com)
- [x] **Verificação de disponibilidade** - horários ocupados mostrados como indisponíveis
- [x] **Criação automática de eventos** no Google Calendar
- [x] Assistente de IA funcional
- [x] API Easypay criando sessões com sucesso
- [x] Webhook Easypay configurado
- [x] **WhatsApp fallback** - salva pedido no app E cria evento no calendário

### PENDENTE
- [ ] SDK Easypay retorna "generic-error" - requer contacto com suporte Easypay

## URLs
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Produção**: https://obeliscoradical.pt

## Integrações Configuradas

### Easypay (Pagamentos)
- Account ID: b7940690-d762-423d-a3d6-b530605cd9cf
- API Key: 00866dd3-71cb-416e-98ad-b6db16b250e6
- Webhook: https://obeliscoradical.pt/api/webhooks/easypay

### Google Calendar
- Client ID: 223328608522-tpfta8u5miid6pvnhfi3on52upsih989.apps.googleusercontent.com
- Email conectado: obeliscoradical@gmail.com
- Funcionalidades:
  - Verificar disponibilidade de horários
  - Criar eventos automaticamente
  - Mostrar slots ocupados no checkout

### App de Gestão
- URL: https://tech-app-obelisco.emergent.host
- Endpoint: POST /api/orders/public

## Fluxo de Pedido

1. Cliente adiciona serviços ao carrinho
2. Preenche dados (nome, email, telefone, morada)
3. Seleciona **Tipo de Serviço**
4. Seleciona **Data** (apenas dias úteis)
5. Seleciona **Hora** (horários ocupados desactivados)
6. Clica "Pagar"
7. Se Easypay funcionar → Pagamento online
8. Se Easypay falhar → Botão WhatsApp que:
   - Salva pedido no app de gestão
   - Cria evento no Google Calendar
   - Abre WhatsApp com mensagem pré-preenchida

## Tipos de Serviço
- Instalação
- Reparação
- Manutenção
- Visita Técnica
- Certificação

## Horários Disponíveis
- Segunda a Sexta
- 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00, 17:00, 18:00

## Próximo Passo Crítico

**CONTACTAR EASYPAY** (suporte@easypay.pt):
"O Checkout SDK (@easypaypt/checkout-sdk) retorna 'generic-error' no site https://obeliscoradical.pt. O que preciso configurar para o checkout inline funcionar?"

## Contactos
- WhatsApp: +351 911 132 401
- Email: obeliscoradical@gmail.com
- Instagram: @obeliscoradical
