# Usar Node.js Alpine para menor tamanho
FROM node:18-alpine

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /backend

# Copiar tudo da pasta atual (production) para /backend
COPY . ./

# Instalar apenas dependências de produção
RUN npm install --only=production && npm cache clean --force

# Criar diretórios necessários
RUN mkdir -p logs && \
    chown -R backend:nodejs /backend

# Mudar para usuário não-root
USER backend

# Expor porta (configurável via ENV)
EXPOSE ${PORT:-3000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Executar aplicação buildada
CMD ["npm", "start"]