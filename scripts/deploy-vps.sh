#!/bin/bash
set -e
echo "🚀 Deploy - Banner Futebol Inforlozzi"
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "✅ Deploy concluído!"
docker-compose ps
