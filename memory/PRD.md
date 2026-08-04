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
- **Preview**: https://obelisco-payments.preview.emergentagent.com
- **Connect Login**: /connect
- **Client Dashboard**: /connect/client
- **Tech Dashboard**: /connect/tech
- **Admin Dashboard**: /connect/admin

## Próximos Passos

### P0 - Configuração Produção
1. Obter RESEND_API_KEY real (criar conta em resend.com)
2. Verificar domínio para emails (evitar spam)
3. Reclamar conta Stripe para produção

### P1 - Melhorias Futuras
1. Relatórios anuais em PDF
2. Notificações por SMS (Twilio)
3. Dashboard analytics para admin
4. App nativo (React Native)

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
