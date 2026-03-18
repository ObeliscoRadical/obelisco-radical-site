# PRD - Obelisco Radical Eletricidade - Integracao Site + App de Pedidos

## Problema Original
O usuario possui um site de servicos eletricos (Obelisco Radical) e queria integrar o checkout do site com seu app de gestao de pedidos (tech-app-obelisco.emergent.host). O objetivo era que os clientes pudessem finalizar pedidos diretamente no site e as informacoes fossem enviadas automaticamente para o app de gestao.

## Arquitetura

### Site Principal
- **URL**: https://form-payments.preview.emergentagent.com
- **Stack**: React + Tailwind CSS + Framer Motion
- **Funcionalidades**:
  - Landing page com secoes: Hero, Servicos, Vantagens, FAQ, Contacto
  - Carrinho de servicos com calculo de precos
  - Checkout com dados do cliente, agendamento e forma de pagamento
  - Integracao com API externa para envio de pedidos

### App de Gestao de Pedidos
- **URL**: https://tech-app-obelisco.emergent.host
- **API**: https://tech-app-obelisco.emergent.host/api
- **Endpoint Publico**: POST /api/orders/public
- **Credenciais**: d.oliveira1986@gmail.com / A24d22r04

### Fluxo de Dados
1. Cliente adiciona servicos ao carrinho no site
2. Cliente preenche dados: nome, email, telefone, morada, codigo postal, observacoes
3. Cliente seleciona data, horario e forma de pagamento
4. Cliente clica em "Finalizar Pedido"
5. Site envia dados para API do app de pedidos
6. App de pedidos recebe e armazena o pedido
7. Tecnico visualiza pedido no painel de gestao

## User Personas

### Cliente Final
- Residentes ou empresas em Lisboa que precisam de servicos eletricos
- Querem solicitar orcamento de forma rapida e organizada
- Preferem finalizar pedido diretamente no site

### Tecnico/Administrador
- Diego Oliveira (proprietario)
- Gerencia pedidos atraves do app tech-app-obelisco
- Recebe notificacoes de novos pedidos

## Requisitos Core (Implementados)

### Site
- [x] Layout responsivo com design profissional
- [x] Secoes: Hero, Servicos, Vantagens, Depoimentos, FAQ, Contacto
- [x] 6 tipos de servicos com precos base
- [x] Carrinho de servicos com quantidades
- [x] Checkout com formulario completo
- [x] Selecao de data e horario
- [x] Selecao de forma de pagamento (MB Way, Transferencia, Dinheiro, Cartao)
- [x] Envio de pedido para API externa
- [x] Tela de confirmacao de sucesso
- [x] Botao WhatsApp flutuante

### Integracao
- [x] Endpoint publico para criacao de pedidos (sem autenticacao)
- [x] Dados enviados: client_name, email, phone, address, service_type, preferred_date, description
- [x] Descricao inclui todos os detalhes: servicos, valores, forma de pagamento, observacoes

## O que foi Implementado (18/03/2026)

1. **Codigo do site integrado** com API do app de pedidos
2. **Funcao handleCheckout** que envia dados formatados para POST /api/orders/public
3. **Estados de feedback**: loading, sucesso, erro
4. **Tela de sucesso** apos envio do pedido
5. **Campo email** adicionado ao formulario (requerido pela API)

## Backlog / Proximas Tarefas

### P0 (Critico)
- Nenhum item pendente

### P1 (Alta Prioridade)
- [ ] Adicionar validacao de email mais robusta
- [ ] Notificacao por email quando novo pedido chegar

### P2 (Media Prioridade)
- [ ] Historico de pedidos para o cliente (com login)
- [ ] Integracao com pagamento online real (Stripe/MB Way API)
- [ ] Confirmacao por SMS

### P3 (Baixa Prioridade)
- [ ] Melhorar UX de adicionar multiplos servicos rapidamente
- [ ] Adicionar mais formas de pagamento
- [ ] Analytics de conversao

## Servicos Disponiveis

| ID | Nome | Preco Base |
|----|------|------------|
| instalacao | Instalacoes Eletricas | EUR50 |
| iluminacao | Iluminacao Interior e Exterior | EUR27.5 |
| manutencao | Manutencao e Reparacao | EUR37 |
| quadro | Quadros Eletricos | EUR150 |
| cablagem | Cablagem Estruturada | EUR95 |
| seguranca | Seguranca e Inspecao | EUR110 |

**Taxa de deslocacao**: EUR35 (fixa)

## Contatos

- **WhatsApp**: +351 911 132 401
- **Email**: obeliscoradical@gmail.com
- **Area**: Grande Lisboa
