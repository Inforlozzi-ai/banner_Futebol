# 🏟️ Banner Futebol - Inforlozzi

Sistema automático de geração e publicação de banners diários de futebol para o Telegram.

Todos os dias às 06h, o sistema busca os jogos do dia, gera um banner personalizado com a identidade visual Inforlozzi e publica automaticamente no seu canal do Telegram.

---

## ✅ O que você vai precisar antes de começar

Antes de instalar, garanta que você tem:

- Um **VPS com Ubuntu 20.04 ou superior** (acesso root via SSH)
- Uma conta gratuita no **[Supabase](https://supabase.com)** (banco de dados)
- Uma chave gratuita na **[API-Football](https://www.api-football.com/)** (dados dos jogos)
- Um **Bot do Telegram** criado via [@BotFather](https://t.me/BotFather)
- O **ID do canal Telegram** onde os banners serão publicados

---

## 🚀 Instalação Completa (Passo a Passo)

### Passo 1 — Conecte no seu VPS via SSH

```bash
ssh root@SEU_IP
```

---

### Passo 2 — Instale o Docker

O projeto roda 100% via Docker. Execute este único comando para instalar:

```bash
curl -fsSL https://get.docker.com | sh
```

Verifique se instalou corretamente:

```bash
docker --version
docker compose version
```

> ✅ Deve aparecer algo como `Docker version 24.x.x` e `Docker Compose version v2.x.x`

---

### Passo 3 — Clone o repositório

```bash
git clone https://github.com/Inforlozzi-ai/banner_Futebol.git
cd banner_Futebol
```

---

### Passo 4 — Configure as variáveis de ambiente

```bash
cp .env.example .env.local
nano .env.local
```

Preencha cada variável conforme a tabela abaixo:

| Variável | Onde encontrar | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | `eyJhbGci...` |
| `API_FOOTBALL_KEY` | [api-football.com](https://www.api-football.com/) → Dashboard → API Key | `abc123...` |
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) → /newbot → token gerado | `123456:ABC-DEF...` |
| `TELEGRAM_CHANNEL_ID` | ID do canal (veja dica abaixo) | `-1001234567890` |

> 💡 **Como descobrir o ID do canal Telegram:**
> Adicione o bot [@userinfobot](https://t.me/userinfobot) ao canal como admin, ele vai te mostrar o ID. O ID de canais sempre começa com `-100`.

Salve o arquivo: `Ctrl+X` → `Y` → `Enter`

---

### Passo 5 — Configure o banco de dados (Supabase)

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**
4. Abra o arquivo `supabase/migrations/001_init.sql` deste repositório
5. Cole o conteúdo no editor e clique em **Run**

> ✅ Isso cria todas as tabelas necessárias automaticamente.

---

### Passo 6 — Suba os containers

```bash
docker compose up -d
```

Aguarde o build (pode levar 2-5 minutos na primeira vez). Após concluir, verifique:

```bash
docker compose ps
```

Deve aparecer os 3 containers com status **Up**:
- `banner-futebol` — aplicação web
- `banner-cron` — agendador de envio diário
- `banner-nginx` — servidor web (porta 80)

---

### Passo 7 — Acesse o painel

Abra no navegador:

```
http://SEU_IP
```

> Se quiser acessar pela porta direta: `http://SEU_IP:3000`

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f app

# Parar tudo
docker compose down

# Reiniciar após alterar .env.local
docker compose down && docker compose up -d

# Ver status dos containers
docker compose ps
```

---

## ❗ Erros Comuns

| Erro | Solução |
|---|---|
| `docker-compose: command not found` | Use `docker compose` (sem hífen) |
| `npm: command not found` | Não instale npm — use Docker conforme este guia |
| Container reiniciando em loop | Verifique os logs: `docker compose logs app` — provavelmente falta variável no `.env.local` |
| Porta 80 ocupada | Outro serviço está na porta 80. Edite `docker-compose.yml` e mude `"80:80"` para `"8080:80"` |

---

## 📋 Stack Técnica

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Banco**: Supabase (PostgreSQL)
- **Geração de imagem**: node-canvas
- **Telegram**: Bot API
- **Agendamento**: node-cron (06:00 BRT)
- **Deploy**: Docker + Nginx + VPS

---

## ⚽ API de Futebol

Utiliza [API-Football](https://www.api-football.com/) — plano gratuito inclui **100 requisições/dia**, suficiente para uso normal.
