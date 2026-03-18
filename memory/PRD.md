# PRD - Obelisco Radical Eletricidade - Site com Pagamentos Online

## Problema Original
O usuario possui um site de servicos eletricos (Obelisco Radical) e queria:
1. Integrar o checkout do site com seu app de gestao de pedidos (tech-app-obelisco)
2. Adicionar pagamento online real com Easypay (Cartao, MB Way, Multibanco)

## Arquitetura

### Site Principal
- **URL**: https://form-payments.preview.emergentagent.com
- **Stack**: React + Tailwind CSS + Framer Motion + Easypay SDK
- **Funcionalidades**:
  - Landing page com secoes: Hero, Servicos, Vantagens, FAQ, Contacto
  - Carrinho de servicos com calculo de precos
  - Checkout com dados do cliente e agendamento
  - **Pagamento online real** via Easypay (Cartao, MB Way, Multibanco)
  - Integracao com app de gestao de pedidos

### Backend
- **Stack**: FastAPI + MongoDB
- **Endpoints de Pagamento**:
  - `POST /api/checkout/create-session` - Cria sessao de pagamento Easypay
  - `GET /api/checkout/payment-methods` - Lista metodos disponiveis
  - `POST /api/webhooks/easypay` - Recebe notificacoes de pagamento
  - `GET /api/payments` - Lista pagamentos
  - `GET /api/payments/{id}` - Detalhes do pagamento

### Gateway de Pagamento (Easypay)
- **Ambiente**: TESTE (credenciais sandbox)
- **Account ID**: 2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6
- **API URL**: https://api.test.easypay.pt/2.0
- **Metodos**: Cartao de Credito, MB Way, Multibanco

### App de Gestao de Pedidos
- **URL**: https://tech-app-obelisco.emergent.host
- **Endpoint Publico**: POST /api/orders/public
- Recebe pedidos automaticamente apos pagamento confirmado

## Fluxo de Pagamento

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

## O que foi Implementado (18/03/2026)

### Fase 1 - Integracao App de Pedidos
- [x] Checkout envia pedidos para app de gestao (sem pagamento)
- [x] Dados do cliente enviados via API publica

### Fase 2 - Pagamento Online Easypay
- [x] SDK Easypay instalado (@easypaypt/checkout-sdk)
- [x] Backend com endpoints de pagamento
- [x] Modal de pagamento com metodos (Cartao, MB Way, Multibanco)
- [x] Integracao com API Easypay (ambiente de teste)
- [x] Webhook para notificacoes de pagamento
- [x] Armazenamento de pagamentos no MongoDB
- [x] Envio automatico para app de gestao apos pagamento

## Proximos Passos para Producao

### P0 - Obrigatorio para ir ao ar
- [ ] Criar conta empresarial na Easypay (https://backoffice.easypay.pt)
- [ ] Obter credenciais de PRODUCAO (Account ID e API Key)
- [ ] Substituir credenciais de teste por producao no backend/.env
- [ ] Configurar webhook URL de producao no Easypay Backoffice
- [ ] Testar pagamento real com valores pequenos

### P1 - Recomendado
- [ ] Notificacao por email quando pagamento confirmado
- [ ] SMS de confirmacao para o cliente
- [ ] Pagina de acompanhamento do pedido

### P2 - Melhorias Futuras
- [ ] Historico de pagamentos para o cliente
- [ ] Sistema de cupons de desconto
- [ ] Pagamento parcelado

## Configuracao para Producao

### 1. Criar conta Easypay
1. Acesse https://backoffice.easypay.pt
2. Crie conta empresarial com NIF portugues
3. Associe conta bancaria portuguesa
4. Aguarde aprovacao (2-3 dias uteis)

### 2. Obter credenciais
1. Login no Backoffice Easypay
2. Va em Developers > Configuration API 2.0
3. Copie Account ID e API Key

### 3. Atualizar backend/.env
```
EASYPAY_ACCOUNT_ID=seu_account_id_producao
EASYPAY_API_KEY=sua_api_key_producao
EASYPAY_BASE_URL=https://api.easypay.pt/2.0
```

### 4. Configurar webhook
1. No Easypay Backoffice, va em Configurations > Webhooks
2. Configure URL: https://seudominio.com/api/webhooks/easypay

## Taxas Easypay (Referencia)
- Cartao de Credito: ~1.4% + EUR0.25
- MB Way: ~0.9% + EUR0.10
- Multibanco: ~0.9% + EUR0.10

## Deploy para GitHub
O usuario tem o site em GitHub. Para fazer deploy:
1. Use o botao **"Save to Github"** no chat da Emergent
2. Ou clique em **"Download Code"** e faca push manual

## Contatos

- **WhatsApp**: +351 911 132 401
- **Email**: obeliscoradical@gmail.com
- **Area**: Grande Lisboa
- **Instagram**: @obeliscoradical
