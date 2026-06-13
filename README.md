# 🏆 Inforlozzi Banner

Sistema automático de geração e publicação de banners diários de esportes no Telegram.

Busca os jogos do dia via **football-data.org**, gera um banner visual com Canvas e envia automaticamente para o Telegram todo dia às **06:00 (Brasília)**.

---

## ✨ Funcionalidades

- ⚽ Futebol: Copa do Mundo, Brasileirão, Champions, Premier League, La Liga e mais
- 🖼️ Gera banner `post` (1080×1350) e `stories` (1080×1920)
- 📱 Envia automaticamente ao Telegram com legenda formatada
- 🔄 Cron job integrado (06:00 diário)
- 🐳 Deploy 100% via Docker Compose

---

## 🚀 Instalação Rápida (recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/Inforlozzi-ai/banner_Futebol/main/install.sh | bash
```

O script interativo vai:
1. Verificar se Docker e Git estão instalados
2. Clonar o repositório em `/opt/inforlozzi-banner`
3. Pedir suas credenciais e validar cada uma
4. Gerar o `.env.local` automaticamente
5. Fazer o build e subir os containers
6. Testar e exibir o status final

---

## 📋 Pré-requisitos

| Requisito | Versão mínima | Como instalar |
|---|---|---|
| Ubuntu/Debian | 20.04+ | — |
| Docker | 24+ | `curl -fsSL https://get.docker.com \| bash` |
| Docker Compose | v2 | Incluído no Docker moderno |
| Git | qualquer | `apt-get install -y git` |

---

## 🔑 Credenciais necessárias

### 1. Football Data API
- Acesse [football-data.org/client/register](https://www.football-data.org/client/register)
- Crie uma conta gratuita
- Copie sua **API Key** no dashboard

### 2. Telegram Bot
- No Telegram, fale com [@BotFather](https://t.me/BotFather)
- Envie `/newbot` e siga as instruções
- Copie o **Bot Token** (formato: `123456789:AAHxxx...`)

### 3. Telegram Chat ID
- Para **canal público**: use `@nome_do_canal`
- Para **canal privado/grupo**: adicione [@userinfobot](https://t.me/userinfobot) ao grupo e ele mostra o ID
- Para **uso pessoal**: fale com [@userinfobot](https://t.me/userinfobot) — ele retorna seu ID

### 4. Supabase (opcional)
- Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
- Pegue a URL e as chaves em **Settings → API**

---

## 🛠️ Instalação Manual

```bash
# 1. Clonar
git clone https://github.com/Inforlozzi-ai/banner_Futebol.git
cd banner_Futebol

# 2. Criar .env.local
cat > .env.local << EOF
FOOTBALL_API_KEY=sua_key_aqui
CRON_SECRET=seu_segredo_aqui
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
EOF

# 3. Criar pasta de banners
mkdir -p public/banners
chown -R 1001:1001 public/banners

# 4. Build e subir
docker compose up -d --build

# 5. Testar (aguardar 30s após o build)
curl -s http://127.0.0.1:3000/api/cron \
  -H "Authorization: Bearer seu_segredo_aqui"
```

---

## 🐳 Containers

| Container | Função | Porta |
|---|---|---|
| `banner-futebol` | App Next.js principal | 3000 |
| `banner-cron` | Executa o cron job diário | — |
| `banner-nginx` | Proxy reverso | 80 |

---

## 📁 Estrutura

```
banner_Futebol/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── cron/route.ts       # Endpoint do cron
│   │       └── games/route.ts      # Lista jogos salvos
│   ├── lib/
│   │   ├── sports-api.ts           # Busca jogos (football-data.org)
│   │   ├── banner-generator.ts     # Gera imagem PNG com Canvas
│   │   ├── telegram.ts             # Envia para o Telegram
│   │   └── football-api.ts         # Helpers da API
│   └── scripts/
│       └── cron.ts                 # Script do cron job
├── public/banners/                 # Banners gerados
├── docker-compose.yml
├── Dockerfile
├── install.sh                      # Auto instalador
└── .env.local                      # Credenciais (não commitado)
```

---

## ⚙️ Comandos úteis

```bash
# Ver logs em tempo real
docker logs banner-futebol -f

# Forçar geração do banner hoje
curl -s http://127.0.0.1:3000/api/cron \
  -H "Authorization: Bearer SEU_CRON_SECRET"

# Ver jogos salvos
curl -s http://127.0.0.1:3000/api/games

# Restart sem rebuild
docker compose restart

# Rebuild completo
docker compose down && docker compose up -d --build

# Ver banners gerados
ls -lh public/banners/
```

---

## 🏆 Competições monitoradas

| Código | Competição | País |
|---|---|---|
| WC | FIFA World Cup | Mundial |
| BSA | Brasileirão Série A | Brasil |
| CL | UEFA Champions League | Europa |
| PL | Premier League | Inglaterra |
| PD | La Liga | Espanha |
| SA | Serie A | Itália |
| FL1 | Ligue 1 | França |
| BL1 | Bundesliga | Alemanha |
| EC | Eurocopa | Europa |
| CLI | Copa Libertadores | América do Sul |

---

## 🔧 Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `FOOTBALL_API_KEY` | ✅ Sim | Chave da football-data.org |
| `CRON_SECRET` | ✅ Sim | Segredo para autenticar o cron |
| `TELEGRAM_BOT_TOKEN` | ✅ Sim | Token do bot Telegram |
| `TELEGRAM_CHAT_ID` | ✅ Sim | ID do canal/grupo destino |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ Não | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ Não | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Não | Chave service role do Supabase |

---

## 📄 Licença

Uso privado — Inforlozzi © 2026
