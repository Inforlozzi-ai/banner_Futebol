#!/bin/bash
# =============================================================
#  INFORLOZZI BANNER - Auto Instalador
#  github.com/Inforlozzi-ai/banner_Futebol
# =============================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${CYAN}"
echo '  ██╗███╗   ██╗███████╗ ██████╗ ██████╗ ██╗      ██████╗ ███████╗███████╗██╗'
echo '  ██║████╗  ██║██╔════╝██╔═══██╗██╔══██╗██║     ██╔═══██╗╚══███╔╝╚══███╔╝██║'
echo '  ██║██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║     ██║   ██║  ███╔╝   ███╔╝ ██║'
echo '  ██║██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║     ██║   ██║ ███╔╝   ███╔╝  ╚═╝'
echo '  ██║██║ ╚████║██║     ╚██████╔╝██║  ██║███████╗╚██████╔╝███████╗███████╗██╗'
echo '  ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝'
echo -e "${NC}"
echo -e "${BOLD}         Sistema de Banners Automaticos de Esportes${NC}"
echo -e "         github.com/Inforlozzi-ai/banner_Futebol"
echo ""
echo -e "${YELLOW}=============================================================${NC}"
echo ""

# ------------------------------------------------------------------
# FUNCOES AUXILIARES
# ------------------------------------------------------------------
ok()   { echo -e "  ${GREEN}[OK]${NC} $1"; }
err()  { echo -e "  ${RED}[ERRO]${NC} $1"; exit 1; }
info() { echo -e "  ${BLUE}[INFO]${NC} $1"; }
ask()  { echo -e "  ${YELLOW}>>>${NC} $1"; }

# ------------------------------------------------------------------
# 1. VERIFICAR DEPENDENCIAS
# ------------------------------------------------------------------
echo -e "${BOLD}[1/6] Verificando dependencias...${NC}"

command -v docker &>/dev/null    || err "Docker nao encontrado. Instale em https://docs.docker.com/engine/install/"
command -v git    &>/dev/null    || err "Git nao encontrado. Execute: apt-get install -y git"
docker compose version &>/dev/null || err "Docker Compose nao encontrado. Atualize o Docker."

ok "Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
ok "Docker Compose: $(docker compose version --short)"
ok "Git: $(git --version | cut -d' ' -f3)"
echo ""

# ------------------------------------------------------------------
# 2. CLONAR OU ATUALIZAR REPOSITORIO
# ------------------------------------------------------------------
echo -e "${BOLD}[2/6] Repositorio...${NC}"

INSTALL_DIR="/opt/inforlozzi-banner"

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Repositorio ja existe em $INSTALL_DIR — atualizando..."
  cd "$INSTALL_DIR"
  git pull origin main
  ok "Repositorio atualizado"
else
  info "Clonando repositorio em $INSTALL_DIR..."
  git clone https://github.com/Inforlozzi-ai/banner_Futebol.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  ok "Repositorio clonado"
fi
echo ""

# ------------------------------------------------------------------
# 3. COLETAR CREDENCIAIS
# ------------------------------------------------------------------
echo -e "${BOLD}[3/6] Configuracao de credenciais${NC}"
echo ""
echo -e "  Voce precisara de:"
echo -e "  ${CYAN}(A)${NC} Chave da API football-data.org  → https://www.football-data.org/client/register"
echo -e "  ${CYAN}(B)${NC} Token do Bot Telegram           → fale com @BotFather no Telegram"
echo -e "  ${CYAN}(C)${NC} Chat ID do Telegram             → ID do canal/grupo ou seu ID pessoal"
echo -e "  ${CYAN}(D)${NC} Supabase URL + Keys             → https://supabase.com (opcional)"
echo ""

# -- Football API --
while true; do
  ask "Cole sua FOOTBALL_API_KEY (football-data.org):"
  read -r FOOTBALL_API_KEY
  if [ -n "$FOOTBALL_API_KEY" ]; then
    # Testar a key
    info "Testando chave da API..."
    RESP=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "X-Auth-Token: $FOOTBALL_API_KEY" \
      "https://api.football-data.org/v4/competitions" 2>/dev/null)
    if [ "$RESP" = "200" ]; then
      ok "API Key valida!"
      break
    else
      echo -e "  ${RED}[ERRO]${NC} Chave invalida (HTTP $RESP). Tente novamente."
    fi
  fi
done
echo ""

# -- Cron Secret --
CRON_SECRET="banner_cron_$(openssl rand -hex 8)"
ok "CRON_SECRET gerado automaticamente: ${CYAN}$CRON_SECRET${NC}"
echo ""

# -- Telegram --
ask "Cole seu TELEGRAM_BOT_TOKEN (ex: 123456789:AAHxxx...):"
read -r TELEGRAM_BOT_TOKEN

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  info "Testando bot token..."
  BOT_TEST=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | grep -o '"ok":true' || true)
  if [ "$BOT_TEST" = '"ok":true' ]; then
    ok "Bot Token valido!"
  else
    echo -e "  ${YELLOW}[AVISO]${NC} Nao foi possivel validar o token. Verifique depois."
  fi
fi
echo ""

ask "Cole seu TELEGRAM_CHAT_ID (ex: -1001234567890 para grupo, 140226876 para usuario):"
read -r TELEGRAM_CHAT_ID
echo ""

# -- Supabase (opcional) --
echo -e "  ${YELLOW}Supabase e opcional. Pressione ENTER para pular.${NC}"
ask "NEXT_PUBLIC_SUPABASE_URL (ex: https://xxxx.supabase.co):"
read -r SUPABASE_URL

if [ -n "$SUPABASE_URL" ]; then
  ask "NEXT_PUBLIC_SUPABASE_ANON_KEY:"
  read -r SUPABASE_ANON_KEY
  ask "SUPABASE_SERVICE_ROLE_KEY:"
  read -r SUPABASE_SERVICE_ROLE_KEY
fi
echo ""

# ------------------------------------------------------------------
# 4. GERAR .env.local
# ------------------------------------------------------------------
echo -e "${BOLD}[4/6] Gerando .env.local...${NC}"

cat > "$INSTALL_DIR/.env.local" << ENVEOF
# === Inforlozzi Banner - Gerado pelo install.sh em $(date) ===

# API de Futebol (football-data.org)
FOOTBALL_API_KEY=${FOOTBALL_API_KEY}

# Segredo do Cron Job
CRON_SECRET=${CRON_SECRET}

# Telegram
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
ENVEOF

if [ -n "$SUPABASE_URL" ]; then
cat >> "$INSTALL_DIR/.env.local" << ENVEOF

# Supabase
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENVEOF
fi

chmod 600 "$INSTALL_DIR/.env.local"
ok ".env.local criado com permissoes seguras (600)"
echo ""

# ------------------------------------------------------------------
# 5. CRIAR PASTA DE BANNERS E FAZER BUILD
# ------------------------------------------------------------------
echo -e "${BOLD}[5/6] Build e inicializacao dos containers...${NC}"

mkdir -p "$INSTALL_DIR/public/banners"
chown -R 1001:1001 "$INSTALL_DIR/public/banners"
ok "Pasta public/banners criada"

cd "$INSTALL_DIR"
info "Fazendo build (pode demorar 5-10 minutos na primeira vez)..."
docker compose down 2>/dev/null || true
docker compose up -d --build

ok "Containers iniciados"
echo ""

# ------------------------------------------------------------------
# 6. TESTE FINAL
# ------------------------------------------------------------------
echo -e "${BOLD}[6/6] Testando instalacao...${NC}"
info "Aguardando containers inicializarem (30s)..."
sleep 30

# Testar health
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "307" ] || [ "$HTTP" = "308" ]; then
  ok "App respondendo na porta 3000"
else
  echo -e "  ${YELLOW}[AVISO]${NC} App retornou HTTP $HTTP — verifique os logs: docker logs banner-futebol"
fi

# Testar cron
info "Disparando busca de jogos..."
CRON_RESP=$(curl -s -X POST http://127.0.0.1:3000/api/cron \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" 2>/dev/null || echo '{"success":false}')

if echo "$CRON_RESP" | grep -q '"success":true'; then
  ok "Cron funcionando! Jogos encontrados e banner gerado."
else
  MSG=$(echo "$CRON_RESP" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
  echo -e "  ${YELLOW}[INFO]${NC} Cron retornou: $MSG"
  info "(Pode ser normal se nao houver jogos hoje)"
fi

# ------------------------------------------------------------------
# RESUMO FINAL
# ------------------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}=============================================================${NC}"
echo -e "${GREEN}${BOLD}  INSTALACAO CONCLUIDA!${NC}"
echo -e "${GREEN}${BOLD}=============================================================${NC}"
echo ""
echo -e "  ${BOLD}Diretorio:${NC}    $INSTALL_DIR"
echo -e "  ${BOLD}App URL:${NC}      http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP'):3000"
echo -e "  ${BOLD}CRON_SECRET:${NC}  $CRON_SECRET"
echo ""
echo -e "  ${BOLD}Comandos uteis:${NC}"
echo -e "  ${CYAN}Ver logs:${NC}          docker logs banner-futebol -f"
echo -e "  ${CYAN}Forcar banner:${NC}     curl -s http://127.0.0.1:3000/api/cron -H \"Authorization: Bearer $CRON_SECRET\""
echo -e "  ${CYAN}Restart:${NC}           cd $INSTALL_DIR && docker compose restart"
echo -e "  ${CYAN}Ver banners:${NC}       ls -lh $INSTALL_DIR/public/banners/"
echo ""
echo -e "  ${BOLD}Cron automatico:${NC} Todo dia as 06:00 (Brasilia) um banner e enviado ao Telegram."
echo ""
echo -e "  ${YELLOW}Guarde seu CRON_SECRET em local seguro!${NC}"
echo ""
