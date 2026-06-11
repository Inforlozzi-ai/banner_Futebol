# 🏟️ Banner Futebol - Inforlozzi

Sistema automático de geração e publicação de banners diários de futebol para Telegram.

## Stack
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Banco**: Supabase (PostgreSQL)
- **Imagem**: Canvas (node-canvas)
- **Telegram**: Bot API
- **Agendamento**: node-cron
- **Deploy**: Docker + VPS

## Funcionalidades
- ✅ Busca automática de jogos via API-Football
- ✅ Geração de banner 1080x1350 (Post) e 1080x1920 (Stories)
- ✅ Identidade visual Inforlozzi
- ✅ Publicação automática no Telegram
- ✅ Painel administrativo
- ✅ Histórico de banners
- ✅ Agendamento às 06:00 diariamente
- ✅ Modo escuro

## Instalação

### 1. Clonar repositório
```bash
git clone https://github.com/Inforlozzi-ai/banner_Futebol.git
cd banner_Futebol
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 3. Instalar dependências
```bash
npm install
```

### 4. Configurar banco de dados
```bash
# Execute o SQL em supabase/migrations/001_init.sql no seu projeto Supabase
```

### 5. Executar em desenvolvimento
```bash
npm run dev
```

## Deploy com Docker

```bash
docker-compose up -d
```

## Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.

## API de Futebol

Utiliza [API-Football](https://www.api-football.com/) (plano gratuito: 100 req/dia).
