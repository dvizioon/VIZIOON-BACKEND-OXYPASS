# 🐳 Deploy OxyPass API com Docker

## Pré-requisitos

- Docker Engine 20.x+
- Docker Compose v2.x+
- Git

## Quick Start

### 1. Preparar o ambiente

```bash
# Clone o repositório (se necessário)
git clone https://github.com/dvizioon/VIZIOON-BACKEND-OXYPASS
cd VIZIOON-BACKEND-OXYPASSi

# Criar arquivo .env para produção
cp .env.example .env
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` com suas configurações:

```bash
# Banco de dados
DB_NAME=oxypass_prod
DB_USER=oxypass_user
DB_PASS=sua_senha_super_forte_aqui
DB_HOST=postgres
DB_PORT=5432

# JWT Secrets (ALTERE EM PRODUÇÃO!)
JWT_SECRET=sua_chave_jwt_super_secreta_de_64_caracteres_ou_mais
JWT_REFRESH_SECRET=outra_chave_diferente_para_refresh_tokens
JWT_RESET_SECRET=terceira_chave_especifica_para_reset_de_senhas

# Servidor - Configurável
NODE_ENV=production
PORT=3000                    # Mude para qualquer porta que desejar
HOST=0.0.0.0                # Use seu DNS/domínio se tiver
BACKEND_URL=https://api.seudominio.com  # ou http://seudominio.com:3000
FRONTEND_URL=https://app.seudominio.com,https://seudominio.com

# Documentação (desativar em produção)
DOC_ACTIVE=false

# Logs
SAVE_LOGS=true
```

### 3. Deploy simples

```bash
# Build e start dos containers
docker-compose up -d

# Verificar logs
docker-compose logs -f oxypass-api

# Verificar status
docker-compose ps

# Parar containers do docker-compose
docker-compose down

# Remover containers, networks, volumes e imagens
docker-compose down --rmi all --volumes --remove-orphans

# Depois de limpar, rebuild sem cache
docker-compose build --no-cache

docker-compose up -d

```

### 4. Exemplos de configuração de porta

```bash
# Para rodar na porta 8080
PORT=8080 docker-compose up -d

# Ou no .env
PORT=8080
HOST=meudominio.com  # Se tiver DNS configurado
```

## Comandos Úteis

### Gerenciamento dos containers

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO - apaga dados!)
docker-compose down -v

# Rebuild da aplicação
docker-compose build oxypass-api

# Restart apenas da API
docker-compose restart oxypass-api

# Ver logs em tempo real
docker-compose logs -f

# Executar comandos dentro do container
docker-compose exec oxypass-api npm run db:migrate
docker-compose exec oxypass-api npm run db:seed


```

### Backup e restore do banco

```bash
# Backup
docker-compose exec postgres pg_dump -U oxypass_user oxypass_prod > backup.sql

# Restore
docker-compose exec -T postgres psql -U oxypass_user oxypass_prod < backup.sql
```

### Monitoramento

```bash
# Health check da API (adapte a porta)
curl http://localhost:3000/api/health
curl http://localhost:8080/api/health  # Se mudou a porta

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs específicos
docker-compose logs postgres
docker-compose logs oxypass-backend
```

## Estrutura de arquivos

```
projeto/
├── Dockerfile              # Build da aplicação
├── docker-compose.yml      # Orquestração dos serviços
├── .dockerignore           # Arquivos ignorados no build
├── .env                    # Variáveis de ambiente
├── dist/                   # Aplicação buildada (gerada)
└── logs/                   # Logs da aplicação (volume)
```

## Configurações de Produção

### Variáveis críticas para alterar:

```bash
# SEMPRE alterar em produção
JWT_SECRET=gere_uma_chave_aleatoria_de_64_caracteres_ou_mais
JWT_REFRESH_SECRET=outra_chave_totalmente_diferente
JWT_RESET_SECRET=terceira_chave_para_reset_de_senhas

# Servidor - Configure conforme necessário
PORT=3000                    # Porta que preferir
HOST=0.0.0.0                # Ou seu domínio/DNS
BACKEND_URL=https://api.seudominio.com
FRONTEND_URL=https://app.seudominio.com

# Desativar documentação em produção
DOC_ACTIVE=false

# Senha forte para o banco
DB_PASS=uma_senha_muito_forte_e_complexa
```

### Reverse Proxy (Nginx/Traefik)

Para produção, configure um reverse proxy na frente:

```nginx
# nginx.conf - Adapte a porta conforme sua configuração
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;  # Mude para sua porta
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Exemplos de Configuração

### Para porta personalizada (ex: 8080)

```bash
# No .env
PORT=8080
HOST=0.0.0.0
BACKEND_URL=http://meuservidor.com:8080

# Deploy
docker-compose up -d

# Teste
curl http://localhost:8080/api/health
```

### Para domínio personalizado

```bash
# No .env
PORT=3000
HOST=api.minhaempresa.com
BACKEND_URL=https://api.minhaempresa.com
FRONTEND_URL=https://app.minhaempresa.com

# Deploy
docker-compose up -d
```

## Troubleshooting

### Container não sobe

```bash
# Verificar logs detalhados
docker-compose logs oxypass-api

# Verificar se o banco está rodando
docker-compose logs postgres

# Testar conectividade
docker-compose exec oxypass-api ping postgres
```

### Aplicação não responde na porta customizada

```bash
# Verificar se a porta está configurada corretamente
docker-compose exec oxypass-api env | grep PORT

# Testar health check na porta certa
curl http://localhost:${PORT}/api/health

# Verificar se a porta está sendo exposta
docker-compose ps
```

## Volumes e Persistência

### Dados persistidos:

- **postgres_data**: Dados do PostgreSQL
- **logs_data**: Logs da aplicação

### Backup dos volumes:

```bash
# Backup do volume do banco
docker run --rm -v oxypass_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore do volume do banco
docker run --rm -v oxypass_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Segurança

### Checklist de segurança:

- [ ] JWT secrets alterados e seguros
- [ ] Senha do banco forte
- [ ] Documentação desabilitada em produção
- [ ] CORS configurado apenas para domínios válidos
- [ ] Rate limiting ativo
- [ ] Porta e host configurados adequadamente
- [ ] Logs sendo salvos
- [ ] Health checks funcionando
- [ ] Backup automatizado configurado
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] Certificados SSL configurados (via reverse proxy)

## Atualizações

```bash
# Atualizar a aplicação
git pull origin main
docker-compose build oxypass-api
docker-compose up -d oxypass-api

# Verificar se tudo funcionou (adapte a porta)
docker-compose logs -f oxypass-api
curl http://localhost:${PORT:-3000}/api/health
```