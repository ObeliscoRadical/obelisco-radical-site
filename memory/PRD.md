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

## Estado Atual (09/12/2025)

### NOVA FUNCIONALIDADE (15/10/2026) - Clientes Manuais (Fatura) no Connect
- [x] **Pedido do utilizador**: admin precisa de uma area para inserir clientes que pagam o plano Obelisco Care por fatura emitida pelo proprio admin (fora do Stripe), com password inicial que o cliente pode alterar depois
- [x] **Backend**: novos endpoints `POST /api/connect/admin/customers` (admin cria cliente, escolhe plano+ciclo, password inicial gerada automaticamente e devolvida uma unica vez) e `POST /api/connect/customer/change-password` (cliente logado muda a propria password)
- [x] **Hashing**: passwords de clientes usam bcrypt (`hash_customer_password`/`verify_customer_password`), distinto do sha256 usado para staff (nao alterado)
- [x] **Login de cliente**: `POST /api/connect/login/customer` agora aceita password opcional - se a subscricao tiver `password_hash` definido (clientes manuais), a password e obrigatoria; clientes antigos pagos via Stripe continuam a entrar so com o email (sem quebra de compatibilidade)
- [x] **Seguranca**: `password_hash` excluido de todas as respostas JSON que devolvem subscricoes (admin list, customer dashboard, customer subscriptions, relatorios)
- [x] **Frontend**: botao "Adicionar Cliente" na tab Subscricoes do Admin Dashboard, modal de criacao (nome/email/telefone/plano/ciclo), modal de credenciais geradas (copiar dados), badge "Fatura Manual" vs "Stripe" na tabela; campo de password opcional no login de cliente; seccao "Mudar Password" na tab Conta do Client Dashboard
- [x] **Testado**: 100% backend (15/15 testes, `/app/backend/tests/test_manual_customer.py`) e 100% frontend (`/app/test_reports/iteration_13.json`), incluindo regressao do login legado so-por-email

### CORREÇÃO CRÍTICA (25/09/2026) - IVA não aparecia em Produção (Live mode)
- [x] **Bug reportado pelo utilizador**: no site já publicado, o checkout Stripe mostrava "Imposto: €0,00" mesmo com morada de Portugal preenchida
- [x] **Causa raiz identificada**: a configuração fiscal do Stripe (Tax Settings + Tax Registration PT + tax_code dos produtos) tinha sido feita apenas no modo de TESTE da conta Stripe via script manual. O modo LIVE é um ambiente de dados separado na mesma conta e nunca recebeu essa configuração
- [x] **Correção aplicada**: a configuração fiscal foi movida para uma função idempotente `ensure_stripe_tax_configured()`, chamada automaticamente no arranque do backend (`@app.on_event("startup")`). Esta função corre contra a chave Stripe atualmente ativa (teste ou live) e configura Tax Settings/Registration/tax_code apenas se ainda não existirem
- [x] **Testado**: reinícios repetidos do backend não criam registos de IVA duplicados; fluxo de teste continua a funcionar corretamente (100% backend/frontend em `/app/test_reports/iteration_12.json`)
- [ ] **AÇÃO NECESSÁRIA DO UTILIZADOR**: fazer um novo deploy/publicação para que esta correção seja executada também no ambiente de produção (chave live) e o IVA passe a ser calculado corretamente no checkout real


- [x] **Stripe Tax (IVA automático) ativado** para os 2 fluxos de checkout: compra unica (`/api/stripe/create-checkout-session`, mode=payment) e subscricao Obelisco Care (`/api/stripe/create-subscription-session`, mode=subscription)
  - `automatic_tax={"enabled": True}` e `billing_address_collection="required"` adicionados a ambas as Checkout Sessions
  - Precos base continuam SEM IVA (tax_behavior=exclusive); Stripe calcula e acrescenta 23% no checkout
- [x] **Configuracao fiscal no Stripe (sandbox de teste)**:
  - `stripe.tax.Settings` com sede em "Praceta Simoes de Almeida Jr 4 Rc Drto, 2745-332 Monte Abraao" e `defaults.tax_behavior=exclusive`
  - `stripe.tax.Registration` criado para Portugal (type=standard, place_of_supply_scheme=standard) - sem isto o Stripe Tax calculava 0% mesmo com endereco PT
  - Tax code `txcd_20080007` (Repairs to Real Property) aplicado aos 3 produtos Obelisco Care e aos itens dinamicos do carrinho
- [x] **Frontend**: etiqueta "+ IVA (23%)" adicionada nos 3 cartoes de planos (Essencial/Preventivo/Total), no modal de subscricao, no resumo do carrinho e no modal de pagamento (cart)
- [x] **`GET /api/stripe/plans`** agora devolve `vat_included: false` e `vat_rate: 23`
- [x] **Validado**: sessão Stripe Checkout real testada via Playwright com endereço PT - mostra corretamente "VAT (23%)" e total com IVA somado, para ambos os fluxos (compra unica e subscricao)
- [x] **Testing agent**: 100% backend e 100% frontend (`/app/test_reports/iteration_11.json`), testes automatizados em `/app/backend/tests/test_stripe_vat.py`

### ATUALIZAÇÃO RECENTE (13/08/2026)
- [x] **Google Analytics 4 (GA4) integrado** no frontend com o Measurement ID `G-V24WWQE39G`
- [x] **Snippet GA4 adicionado ao HTML principal** em `/app/frontend/public/index.html` para permitir deteção pelo Google Search Console
- [x] **Tracking de page views** ligado no React através de `/app/frontend/src/utils/analytics.js` e integração em `/app/frontend/src/App.js`
- [x] **Validação concluída** em `/` e `/connect`: script GA4 presente no HTML, `window.gtag` ativo e sem erros de console relacionados
- [x] **Nova secret de backend adicionada no preview**: `SITE_PUBLISH_SHARED_SECRET` em `/app/backend/.env`, com reinício e validação da API concluídos
- [x] **Novo endpoint backend criado**: `POST /api/public/site/inbound` para receber/publicar conteúdo vindo do CEO AI com validação por `X-Site-Publish-Secret`
- [x] **Persistência MongoDB adicionada**: coleção `site_content_entries` com índices únicos e sparse em `remote_entry_id` e `slug`
- [x] **QA concluído no preview**: testes automáticos passaram 100% para 401 sem secret, upsert, update, delete e edge cases do endpoint inbound (`/app/test_reports/iteration_10.json`)
- [x] **Deploy readiness ajustada**: URLs fixas foram removidas do backend/frontend e substituídas por `APP_URL` e `REACT_APP_ORDERS_API`
- [x] **Health check de deploy aprovado**: varrimento de deployment sem blockers, compilação ok e app pronta para novo deploy

### CORREÇÃO CRÍTICA APLICADA (09/12/2025)
- [x] **Bug P0 corrigido**: Login de staff falhava por inconsistência de coleção/hash
  - **Problema**: `startup_seed_accounts` escrevia em `db.technicians` com bcrypt, mas login lia de `db.staff_users` com sha256
  - **Solução**: Unificado tudo para `staff_users` + sha256 + `status: "active"`
  - **Segurança**: Removida rota `/api/fix-admin` (vulnerabilidade)
  - **Credenciais**: Agora lidas de variáveis de ambiente (`ADMIN_STAFF_EMAIL`, etc.)

- [x] **Bug corrigido**: Criar técnico pelo dashboard admin não funcionava
  - **Problema**: Endpoint esperava query params, frontend enviava JSON body
  - **Solução**: Criado modelo `CreateTechnicianRequest` e endpoint alterado para aceitar JSON
  - **Limpeza**: Removidos dados de teste (contas `test_tech_*`) da base de dados

- [x] **NOVO**: Carrossel Hero Enterprise Grade implementado
  - 4 slides com imagens geradas por IA (infraestruturas, plataforma digital, frota, qualidade)
  - Autoplay com transição cross-fade
  - Barras de progresso horizontais
  - Pause on hover
  - Totalmente responsivo (mobile/tablet/desktop)
  - Componente: `/app/frontend/src/components/HeroCarousel.js`

- [x] **ATUALIZAÇÃO**: Carrossel v2 - Imagens personalizadas e Obelisco Care
  - Novas imagens: carrinhas preto mate, infraestrutura industrial, dashboard moderno
  - Slide dedicado ao **Obelisco Care** com badges de features (Cobertura Total, Resposta 24h, Suporte Dedicado)
  - CTAs ajustados para secções corretas: #contact, #services, #obelisco-care, #vantagens
  - Preço destacado: "A partir de 39€/mês"

- [x] **ATUALIZAÇÃO**: Carrossel v3 - A/B Test e Shimmer Effect
  - **Obelisco Care agora é o PRIMEIRO slide** (teste A/B para conversão)
  - Badge com **efeito shimmer animado** para slides promo
  - Ícone Zap pulsante no badge do Obelisco Care
  - Gradiente mais vibrante no badge promo

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

#### Obelisco Connect - Fase 1 a 4 ✅
- [x] PWA instalável com manifest.json e service-worker
- [x] Login unificado por roles (CUSTOMER, TECHNICIAN, ADMIN)
- [x] Dashboards completos para Cliente, Técnico e Admin
- [x] Timer de serviço, checklist, upload de fotos/vídeos
- [x] Assinatura digital do cliente
- [x] Débito automático de horas

#### Novas Funcionalidades Implementadas ✅

**Emails Automáticos:**
- [x] Email ao admin quando novo pedido é criado
- [x] Email ao técnico quando trabalho é atribuído
- [x] Email ao cliente quando trabalho é concluído
- [x] Usando Resend API com templates HTML styled

**Push Notifications:**
- [x] Web Push API nativo (sem Firebase)
- [x] VAPID keys configuradas
- [x] Service Worker atualizado para notificações
- [x] Botão para ativar notificações nos dashboards
- [x] Push enviado ao técnico quando trabalho é atribuído

**File Storage (GridFS):**
- [x] Upload de ficheiros para MongoDB GridFS
- [x] Endpoints: POST /files/upload, GET /files/{id}, DELETE /files/{id}
- [x] Suporte para fotos, vídeos e assinaturas

**Relatórios PDF:**
- [x] Endpoint: GET /reports/monthly/{subscription_id}
- [x] PDF com ReportLab: resumo de horas, work logs, ajustes
- [x] Download direto do dashboard do cliente
- [x] Estilo Obelisco (preto/dourado)

### ENDPOINTS NOVOS

**Emails:**
- `POST /api/notifications/send-email` - Email manual (admin)

**Push:**
- `GET /api/push/vapid-public-key` - Obter chave pública
- `POST /api/push/subscribe` - Registar subscription
- `DELETE /api/push/unsubscribe` - Remover subscription

**Files:**
- `POST /api/files/upload` - Upload para GridFS
- `GET /api/files/{file_id}` - Download ficheiro
- `DELETE /api/files/{file_id}` - Apagar ficheiro

**Reports:**
- `GET /api/reports/monthly/{subscription_id}` - PDF mensal
- `GET /api/reports/subscription-summary/{subscription_id}` - Resumo JSON

**Site Content Inbound:**
- `POST /api/public/site/inbound` - Receber conteúdo publicado externamente (CEO AI) com `X-Site-Publish-Secret`

### CONFIGURAÇÃO (.env)

```env
# Email
RESEND_API_KEY=re_xxx
SENDER_EMAIL=obeliscoradical@gmail.com
ADMIN_NOTIFICATION_EMAIL=obeliscoradical@gmail.com

# Push Notifications
VAPID_PRIVATE_KEY_PATH=/tmp/vapid_private.pem
VAPID_PUBLIC_KEY_PATH=/tmp/vapid_public.pem
VAPID_APPLICATION_SERVER_KEY=BNaIi3h...
VAPID_CLAIMS_EMAIL=mailto:obeliscoradical@gmail.com
```

### URLs
- **Preview**: https://obelisco-carousel.preview.emergentagent.com
- **Connect Login**: /connect
- **Client Dashboard**: /connect/client
- **Tech Dashboard**: /connect/tech
- **Admin Dashboard**: /connect/admin

## Próximos Passos

### P0 - Configuração Produção
1. **FAZER DEPLOY** para aplicar correção do login de staff e o novo IVA no Stripe
2. Obter RESEND_API_KEY real (criar conta em resend.com)
3. Verificar domínio para emails (evitar spam)
4. Reclamar conta Stripe para produção (claim do sandbox) - a configuração fiscal (Tax Settings + Registration PT) foi feita no sandbox de teste; confirmar que se mantém após ativação da conta real ou repetir se necessário
5. Revalidar a propriedade no Google Search Console após novo crawl do site

### P1 - Segurança e Qualidade
1. Migrar `connect_token` de localStorage para cookies httpOnly
2. Corrigir dependências faltantes nos useEffect (App.js e Dashboards)
3. Refatorar `server.py` - funções complexas (stripe_webhook, etc.)

### P2 - Melhorias Futuras
1. Relatórios anuais em PDF
2. Notificações por SMS (Twilio)
3. Dashboard analytics para admin
4. App nativo (React Native)
5. Remover console.log de produção
6. Refatorar App.js em componentes menores

## Contactos
- WhatsApp: +351 911 132 401
- Email: obeliscoradical@gmail.com
- Instagram: @obeliscoradical

## Notas Técnicas

### Arquitetura
```
/app
├── backend/
│   ├── server.py      # FastAPI (2800+ linhas)
│   └── .env           # Todas as configurações
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ConnectLogin.js
│   │   │   ├── ConnectClientDashboard.js
│   │   │   ├── ConnectTechDashboard.js
│   │   │   └── ConnectAdminDashboard.js
│   │   ├── components/
│   │   │   └── SignaturePad.js
│   │   └── utils/
│   │       └── pushNotifications.js
│   └── public/
│       └── service-worker.js (push support)
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

### Cartão de Teste Stripe
- Número: 4242 4242 4242 4242
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos
