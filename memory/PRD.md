# PRD - Obelisco Radical Eletricidade - Site com Pagamentos Online e Chat IA

## Problema Original
O usuario possui um site de servicos eletricos (Obelisco Radical) e queria:
1. Integrar o checkout do site com seu app de gestao de pedidos (tech-app-obelisco)
2. Adicionar pagamento online real com Easypay (Cartao, MB Way, Multibanco)
3. Assistente de IA para diagnostico de problemas eletricos

## Arquitetura

### Site Principal
- **URL Preview**: https://obelisco-payments.preview.emergentagent.com
- **URL Producao**: https://obeliscoradical.pt
- **Stack**: React + Tailwind CSS + Framer Motion + Easypay SDK
- **Funcionalidades**:
  - Landing page com secoes: Hero, Servicos, Vantagens, FAQ, Contacto
  - Carrinho de servicos com calculo de precos
  - Checkout com dados do cliente e agendamento
  - **Pagamento online real** via Easypay (Cartao, MB Way, Multibanco)
  - **Assistente de IA** para diagnostico de problemas eletricos
  - Integracao com app de gestao de pedidos

### Backend
- **Stack**: FastAPI + MongoDB
- **Endpoints de Pagamento**:
  - `POST /api/checkout/create-session` - Cria sessao de pagamento Easypay
  - `GET /api/checkout/payment-methods` - Lista metodos disponiveis
  - `POST /api/webhooks/easypay` - Recebe notificacoes de pagamento
  - `GET /api/payments` - Lista pagamentos
  - `GET /api/payments/{id}` - Detalhes do pagamento
- **Endpoint IA**:
  - `POST /api/electrical-assistant` - Chat IA para diagnostico

### Gateway de Pagamento (Easypay)
- **Ambiente**: PRODUCAO
- **Account ID**: b7940690-d762-423d-a3d6-b530605cd9cf
- **API Key**: 00866dd3-71cb-416e-98ad-b6db16b250e6
- **API URL**: https://api.prod.easypay.pt/2.0
- **Metodos Configurados**: MB Way, Multibanco
- **Webhook URL**: https://obeliscoradical.pt/api/webhooks/easypay

### App de Gestao de Pedidos
- **URL**: https://tech-app-obelisco.emergent.host
- **Endpoint Publico**: POST /api/orders/public
- Recebe pedidos automaticamente apos pagamento confirmado

## Estado Atual (22/03/2026)

### Funcional
- [x] Site completo com todas as secoes
- [x] Carrinho de compras
- [x] Checkout com dados do cliente e agendamento
- [x] Assistente de IA funcional
- [x] API Easypay criando sessoes de checkout com sucesso
- [x] Webhook configurado no Easypay Backoffice
- [x] Fallback para WhatsApp quando pagamento falha

### Problema Pendente - Easypay SDK
- [ ] O SDK inline da Easypay (@easypaypt/checkout-sdk) retorna "generic-error"
- **Causa provavel**: Configuracao de dominio/checkout nao activada na conta Easypay
- **Solucao necessaria**: Contactar suporte Easypay para activar checkout SDK

### Solucao Temporaria Implementada
Quando o checkout Easypay falha, o site mostra:
- Mensagem de erro amigavel
- Botao "Contactar via WhatsApp" que abre conversa com valor do pedido

## Proximo Passo Critico

**CONTACTAR EASYPAY:**
- Email: suporte@easypay.pt
- Pergunta: "O Checkout SDK (@easypaypt/checkout-sdk) esta a retornar 'generic-error' no meu site https://obeliscoradical.pt. O que preciso configurar para activar o checkout inline?"

## Fluxo de Pagamento (Quando funcionar)

1. Cliente adiciona servicos ao carrinho
2. Cliente preenche dados (nome, email, telefone, morada)
3. Cliente seleciona data e horario
4. Cliente clica em "Pagar com Cartao / MB Way / Multibanco"
5. Modal de pagamento Easypay abre
6. Cliente escolhe metodo e completa pagamento
7. Easypay processa transacao
8. Webhook notifica backend do resultado
9. Pedido e enviado para app de gestao
10. Cliente ve tela de sucesso

## O que foi Implementado

### Fase 1 - Integracao App de Pedidos
- [x] Checkout envia pedidos para app de gestao

### Fase 2 - Pagamento Online Easypay
- [x] SDK Easypay instalado (@easypaypt/checkout-sdk)
- [x] Backend com endpoints de pagamento
- [x] Modal de pagamento com metodos (Cartao, MB Way, Multibanco)
- [x] Integracao com API Easypay (ambiente de producao)
- [x] Webhook configurado
- [x] Armazenamento de pagamentos no MongoDB

### Fase 3 - Assistente de IA
- [x] Componente ElectricalAssistant.js
- [x] Endpoint /api/electrical-assistant no backend
- [x] Usa Emergent LLM Key

## Melhorias Futuras (P2)

- [ ] Notificacao por email quando pagamento confirmado
- [ ] SMS de confirmacao para o cliente
- [ ] Pagina de acompanhamento do pedido
- [ ] Historico de pagamentos para o cliente
- [ ] Sistema de cupons de desconto
- [ ] Refatorar App.js (1800+ linhas) em componentes menores

## Contatos

- **WhatsApp**: +351 911 132 401
- **Email**: obeliscoradical@gmail.com
- **Area**: Grande Lisboa
- **Instagram**: @obeliscoradical
