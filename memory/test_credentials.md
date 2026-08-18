# Test Credentials - Obelisco Radical

## Obelisco Connect - Sistema Unificado

### Cliente (Portal do Cliente)
- **Email:** teste.obelisco@gmail.com
- **Password:** Não necessária (login por email)
- **Plano:** Total (1.290 EUR/mês)
- **Horas:** 8.5h disponíveis de 12h

### Administrador
- **Email:** admin@obelisco.pt
- **Password:** admin123
- **Role:** ADMIN

### Técnico
- **Email:** tecnico@obelisco.pt
- **Password:** tech123
- **Role:** TECHNICIAN

## Como Testar

### Login Cliente
1. Aceder a: https://obelisco-carousel.preview.emergentagent.com/connect
2. Manter "Cliente" selecionado
3. Inserir: `teste.obelisco@gmail.com`
4. Clicar "Aceder com Email"

### Login Admin/Técnico
1. Aceder a: https://obelisco-carousel.preview.emergentagent.com/connect
2. Clicar em "Equipa / Admin"
3. Inserir email e password
4. Clicar "Entrar"

## Cartão de Teste Stripe
- **Número:** 4242 4242 4242 4242
- **Validade:** Qualquer data futura (ex: 12/30)
- **CVC:** Qualquer 3 dígitos (ex: 123)

## URLs
- **Site Principal:** https://obelisco-carousel.preview.emergentagent.com
- **Obelisco Connect:** https://obelisco-carousel.preview.emergentagent.com/connect

## Endpoint de Publicação de Conteúdo
- **Preview URL:** https://obelisco-carousel.preview.emergentagent.com/api/public/site/inbound
- **Header obrigatório:** `X-Site-Publish-Secret: local-site-publish-secret`
