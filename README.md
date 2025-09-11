# Documentação Técnica - OxyPass API

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Modelos de Dados](#modelos-de-dados)
5. [API Endpoints](#api-endpoints)
6. [Middlewares](#middlewares)
7. [Services](#services)
8. [Sistema de Templates](#sistema-de-templates)
9. [Auditoria](#auditoria)
10. [Configuração e Deploy](#configuração-e-deploy)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)
12. [Build e Produção](#build-e-produção)
13. [Segurança](#segurança)

---

## Visão Geral

O **OxyPass** é uma API REST desenvolvida em Node.js que permite o gerenciamento e reset de senhas de usuários em plataformas Moodle. O sistema oferece uma interface centralizada para administrar múltiplas instâncias Moodle, com funcionalidades de auditoria, templates de email personalizáveis e autenticação robusta.

### Características Principais

- **Multi-tenant**: Suporte a múltiplas instâncias Moodle
- **Reset de senha público**: Endpoints públicos para solicitação de reset
- **Sistema de auditoria**: Log completo de todas as operações
- **Templates personalizáveis**: Sistema de templates com variáveis dinâmicas
- **Autenticação JWT**: Sistema de autenticação baseado em tokens
- **Rate limiting**: Proteção contra ataques de força bruta
- **Documentação Swagger**: API totalmente documentada

---

## Arquitetura

### Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Sequelize
- **Autenticação**: JWT (jsonwebtoken)
- **Documentação**: Swagger UI Express
- **Build**: Webpack 5 com obfuscação opcional

### Padrão Arquitetural

O projeto segue uma arquitetura em camadas (Layered Architecture):

```
┌─────────────────┐
│    Routers      │ ← Definição de rotas e documentação Swagger
├─────────────────┤
│   Controllers   │ ← Lógica de controle e validação de entrada
├─────────────────┤
│    Services     │ ← Regras de negócio e integração
├─────────────────┤
│     Models      │ ← Definição de dados e relacionamentos
├─────────────────┤
│    Database     │ ← PostgreSQL com Sequelize ORM
└─────────────────┘
```

---

## Estrutura do Projeto

```
src/
├── config/                 # Configurações
│   ├── auth.js             # Configurações JWT e rate limiting
│   └── config.js           # Configurações do banco de dados
├── controller/             # Controladores da aplicação
│   ├── auditingController.js
│   ├── authController.js
│   ├── moodleController.js
│   ├── templatesEmailController.js
│   ├── userController.js
│   └── webServiceController.js
├── database/               # Configuração e gerenciamento do banco
│   ├── database.js         # Conexão e modelos
│   ├── seed.js            # Dados iniciais
│   └── sync.js            # Sincronização de tabelas
├── helpers/               # Utilitários auxiliares
│   └── timeHelpers.js     # Funções de manipulação de tempo
├── lib/                   # Bibliotecas internas
│   └── api.js            # Cliente HTTP para Moodle
├── middleware/            # Middlewares da aplicação
│   ├── isAdmin.js         # Verificação de privilégios admin
│   ├── isAuth.js          # Autenticação JWT
│   ├── rateLimiter.js     # Rate limiting
│   └── tokenMiddleware.js # Utilitários JWT
├── model/                 # Modelos Sequelize
│   ├── Auditing.js
│   ├── TemplatesEmail.js
│   ├── User.js
│   └── WebService.js
├── router/                # Definição de rotas
│   ├── auditingRouter.js
│   ├── authRouter.js
│   ├── index.js
│   ├── moodleRouter.js
│   ├── templatesEmailRouter.js
│   ├── userRouter.js
│   └── webServiceRouter.js
├── service/               # Camada de serviços
│   ├── serviceAuditing/   # Serviços de auditoria
│   ├── serviceEmail/      # Integração com sistema de email
│   ├── serviceMoodle/     # Integração com API Moodle
│   ├── serviceTemplatesEmail/ # Gerenciamento de templates
│   ├── serviceUser/       # Gerenciamento de usuários
│   └── serviceWeb/        # Gerenciamento de WebServices
├── utils/                 # Utilitários globais
│   └── logger.js          # Sistema de logging
└── server.js              # Arquivo principal
```

---

## Modelos de Dados

### User
Gerencia usuários do sistema administrativo.

```javascript
{
  id: INTEGER (PK, AUTO_INCREMENT),
  name: STRING(100) NOT NULL,
  email: STRING UNIQUE NOT NULL,
  password: STRING NOT NULL (bcrypt),
  role: ENUM('user', 'admin') DEFAULT 'user',
  createdAt: DATE,
  updatedAt: DATE
}
```

### WebService
Configurações de conexão com instâncias Moodle.

```javascript
{
  id: UUID (PK),
  protocol: ENUM('http', 'https') DEFAULT 'https',
  url: STRING NOT NULL,
  token: TEXT,
  moodleUser: STRING (opcional),
  moodlePassword: STRING (opcional),
  serviceName: STRING NOT NULL,
  route: STRING DEFAULT '/webservice/rest/server.php',
  isActive: BOOLEAN DEFAULT true,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Auditing
Log de todas as operações de reset de senha.

```javascript
{
  id: UUID (PK),
  userId: INTEGER (ID do usuário no Moodle),
  username: STRING,
  email: STRING,
  webServiceId: UUID (FK → WebService),
  tokenUser: TEXT (Token JWT de reset),
  useToken: BOOLEAN DEFAULT false,
  emailSent: BOOLEAN DEFAULT false,
  tokenExpiresAt: DATE,
  description: STRING,
  status: ENUM('error', 'success', 'pending'),
  createdAt: DATE,
  updatedAt: DATE
}
```

### TemplatesEmail
Templates HTML personalizáveis para emails.

```javascript
{
  id: UUID (PK),
  name: STRING(100) NOT NULL,
  description: TEXT,
  subject: STRING(200) NOT NULL,
  content: TEXT NOT NULL,
  type: ENUM('html', 'text') DEFAULT 'html',
  isActive: BOOLEAN DEFAULT true,
  isDefault: BOOLEAN DEFAULT false,
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## API Endpoints

### Autenticação

#### POST /api/auth/login
Autenticação de usuários administrativos.

**Request:**
```json
{
  "email": "admin@oxypass.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@oxypass.com",
    "role": "admin"
  }
}
```

### Moodle (Rotas Públicas)

#### GET /api/moodle/urls
Lista URLs dos WebServices ativos.

**Query Parameters:**
- `base` (opcional): `simples` ou `full`

**Response:**
```json
{
  "success": true,
  "urls": [
    { "url": "ead.ceuma.br" }
  ],
  "total": 1,
  "base": "simples"
}
```

#### POST /api/moodle/reset-password
Solicita reset de senha (ROTA PÚBLICA).

**Request:**
```json
{
  "moodleUrl": "ead.ceuma.br",
  "email": "usuario@exemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se o usuário existir, um email de reset de senha será enviado",
  "timestamp": "2025-09-09T01:00:00.000Z"
}
```

#### POST /api/moodle/validate-reset-token
Valida token de reset (ROTA PÚBLICA).

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/moodle/change-password
Redefine senha com token (ROTA PÚBLICA).

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "novaSenha123"
}
```

### Usuários (Autenticação Obrigatória)

#### GET /api/user/profile
Retorna perfil do usuário autenticado.

#### GET /api/user/all
Lista todos os usuários (ADMIN ONLY).

**Query Parameters:**
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Registros por página (default: 50)

### WebServices (ADMIN ONLY)

#### GET /api/webservice
Lista todos os WebServices configurados.

#### POST /api/webservice
Cria novo WebService.

**Campos Obrigatórios:**
- `url`: URL do Moodle
- `token`: Token de acesso
- `serviceName`: Nome identificador
- `protocol`: http ou https

**Campos Opcionais:**
- `route`: Rota do WebService (padrão: /webservice/rest/server.php)
- `moodleUser`: Usuário admin do Moodle
- `moodlePassword`: Senha do usuário admin

#### PATCH /api/webservice/{id}/toggle
Ativa/desativa WebService.

### Templates de Email (ADMIN ONLY)

#### GET /api/templates-email
Lista templates com paginação.

#### POST /api/templates-email
Cria novo template.

#### PATCH /api/templates-email/{id}/toggle
Ativa/desativa template.

#### PATCH /api/templates-email/{id}/set-default
Define template como padrão.

#### GET /api/templates-email/variables
Lista variáveis disponíveis para templates.

### Auditoria (ADMIN ONLY)

#### GET /api/auditing
Lista registros de auditoria com paginação.

#### GET /api/auditing/{id}
Busca registro específico.

---

## Middlewares

### isAuth
Verifica autenticação JWT e adiciona dados do usuário à requisição.

**Funcionalidades:**
- Extrai token do header Authorization
- Valida token JWT
- Busca usuário no banco de dados
- Adiciona `req.user`, `req.userId`, `req.token` à requisição

### isAdmin
Verifica privilégios de administrador (deve ser usado após isAuth).

**Funcionalidades:**
- Verifica se `req.user.role === 'admin'`
- Retorna 403 se usuário não é admin

### rateLimiter
Implementa rate limiting para proteção contra ataques.

**Configurações:**
- **Reset Password**: 3 tentativas por 15 minutos
- **Login**: 5 tentativas por 15 minutos
- **API Geral**: 100 requests por 15 minutos

---

## Services

### serviceMoodle
Integração com APIs nativas do Moodle.

**Principais Classes:**
- `MoodleFindUserService`: Busca usuários via `core_user_get_users_by_field`
- `MoodleResetPasswordService`: Gerencia processo completo de reset
- `MoodleUpdateUserService`: Atualiza usuários via `core_user_update_users`
- `MoodleVariablesService`: Sistema de variáveis para templates

### serviceEmail
Integração com gateway de email (OxyMail).

**Funcionalidades:**
- Envio de emails HTML personalizados
- Integração com templates
- Substituição automática de variáveis

### serviceWeb
Gerenciamento de configurações WebService.

**Operações CRUD:**
- Criar, listar, atualizar, deletar WebServices
- Busca por URL para roteamento automático
- Toggle ativo/inativo

### serviceTemplatesEmail
Gerenciamento de templates de email.

**Funcionalidades:**
- CRUD completo de templates
- Sistema de template padrão
- Renderização com variáveis
- Suporte a HTML e texto

### serviceAuditing
Sistema de auditoria e logs.

**Funcionalidades:**
- Registro de todas operações
- Rastreamento de tokens
- Status de email enviado
- Histórico completo

---

## Sistema de Templates

### Variáveis Disponíveis

#### Usuário
- `{{user.id}}`: ID do usuário no Moodle
- `{{user.username}}`: Nome de usuário
- `{{user.firstname}}`: Primeiro nome
- `{{user.lastname}}`: Sobrenome
- `{{user.fullname}}`: Nome completo
- `{{user.email}}`: Email do usuário
- `{{user.idnumber}}`: Número de identificação

#### Sistema
- `{{system.currentDate}}`: Data atual (formato BR)
- `{{system.currentTime}}`: Hora atual
- `{{system.name}}`: Nome do sistema

#### Reset de Senha
- `{{reset.link}}`: Link completo para reset
- `{{reset.token}}`: Token JWT completo
- `{{reset.expirationTime}}`: Tempo de expiração

#### WebService
- `{{webservice.serviceName}}`: Nome do serviço
- `{{webservice.url}}`: URL do Moodle

### Modificadores

Suporte a truncamento de texto:
- `{{reset.token(50)}}`: Exibe apenas 50 caracteres do token
- `{{user.email(30)}}`: Trunca email em 30 caracteres

---

## Auditoria

### Fluxo de Auditoria

1. **Requisição de Reset**: Registro inicial com status 'pending'
2. **Validação de Usuário**: Atualização com dados do usuário encontrado
3. **Geração de Token**: Armazenamento do token JWT
4. **Envio de Email**: Marcação como 'email_sent: true'
5. **Uso do Token**: Marcação como 'use_token: true'
6. **Status Final**: 'success', 'error' ou 'pending'

### Campos Rastreados

- **Identificação**: userId, username, email
- **WebService**: webServiceId para rastreamento da instância
- **Token**: tokenUser, tokenExpiresAt, useToken
- **Email**: emailSent
- **Status**: status, description
- **Timestamps**: created_at, updated_at

---

## Configuração e Deploy

### Requisitos do Sistema

- **Node.js**: 18.x ou superior
- **PostgreSQL**: 12.x ou superior
- **RAM**: Mínimo 512MB
- **Disco**: 100MB para aplicação + espaço para logs

### Instalação

```bash
# Clone do repositório
git clone https://github.com/dvizioon/VIZIOON-BACKEND-OXYPASS
cd VIZIOON-BACKEND-OXYPASS

# Instalação de dependências
npm install

# Configuração do banco
npm run setup
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Inicia em modo desenvolvimento

# Build
npm run build                  # Build bundle único (produção)
npm run build:obfuscated      # Build com obfuscação
npm run build:structured     # Build mantendo estrutura

# Produção
npm run start:prod            # Executa versão buildada
npm run start:secure         # Build + obfuscação + execução

# Banco de dados
npm run db:create            # Cria banco de dados
npm run db:migrate           # Executa migrações
npm run db:seed              # Insere dados iniciais
npm run setup                # Setup completo
```

---

## Variáveis de Ambiente

### Obrigatórias

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oxypass_db
DB_USER=postgres
DB_PASS=senha_do_banco

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte
JWT_RESET_SECRET=chave_para_reset_tokens

# Servidor
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

### Opcionais

```env
# URLs e Paths
BACKEND_URL=https://api.oxypass.com
FRONTEND_URL=https://app.oxypass.com,https://oxypass.com
RESET_PASSWORD_PATH=reset-password?token

# Documentação
DOC_ACTIVE=true
DOC_VERSION=1.0.0
DOCUMENTATION_URL=/docs
NAME_SERVICE=OxyPass

# Rate Limiting
RATE_LIMIT_WHITELIST=127.0.0.1,::1

# Debug
DB_DEBUG=false
```

### Configuração de Produção

```env
NODE_ENV=production
DB_DEBUG=false
DOC_ACTIVE=false
JWT_SECRET=chave_super_secreta_aleatoria_64_caracteres_minimo
JWT_RESET_SECRET=outra_chave_diferente_para_reset_tokens
```

---

## Build e Produção

### Build Standard (Bundle Único)

```bash
npm run build
```

Gera arquivo único `dist/server.bundle.js` com todas as dependências.

**Vantagens:**
- Deploy simples (arquivo único)
- Todas as dependências incluídas
- Otimizado para produção

### Build Obfuscado

```bash
npm run build:obfuscated
```

Aplicações de segurança adicional:
- Ofuscação de código JavaScript
- Renomeação de variáveis
- Proteção contra engenharia reversa
- Strings codificadas

### Build Estruturado

```bash
npm run build:structured
```

Mantém estrutura de pastas original.

**Vantagens:**
- Facilita debugging
- Permite hot-reload
- Manutenção simplificada

### Deploy de Produção

1. **Preparação do Ambiente:**
```bash
# Instalar dependências de produção
npm ci --only=production

# Build seguro
npm run build:obfuscated
```

2. **Configuração do Banco:**
```bash
# Setup inicial
npm run setup
```

---

## Segurança

### Autenticação e Autorização

- **JWT Tokens**: Autenticação baseada em tokens seguros
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Role-based Access**: Separação entre usuários e administradores
- **Token Expiration**: Tokens com expiração configurável

### Proteção de Dados

- **Password Hashing**: bcrypt com salt rounds
- **Sensitive Data**: Campos sensíveis não expostos em APIs
- **CORS**: Configuração restritiva de origens permitidas
- **Environment Variables**: Separação de configurações sensíveis

### Validação e Sanitização

- **Input Validation**: Validação rigorosa de entrada via Sequelize
- **SQL Injection**: Proteção via ORM (Sequelize)
- **XSS Protection**: Headers de segurança configurados

### Auditoria e Monitoramento

- **Logging Completo**: Registro de todas as operações
- **Audit Trail**: Rastreamento completo de reset de senhas
- **Error Tracking**: Logs detalhados de erros
- **Request Monitoring**: Log de todas as requisições HTTP

### Configurações de Produção

```javascript
// Configurações recomendadas para produção
const productionConfig = {
  // JWT com expiração curta
  JWT_EXPIRES_IN: '15m',
  
  // Rate limiting agressivo
  RATE_LIMIT_WINDOW: '15m',
  RATE_LIMIT_MAX: 100,
  
  // CORS restritivo
  FRONTEND_URL: 'https://app.oxypass.com',
  
  // Logs sem debug
  DB_DEBUG: false,
  
  // Documentação desabilitada
  DOC_ACTIVE: false
};
```

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas
- [ ] JWT secrets seguros (mínimo 64 caracteres)
- [ ] Rate limiting ativo
- [ ] CORS configurado para domínios específicos
- [ ] Logs de auditoria funcionando
- [ ] Banco de dados com usuário restrito
- [ ] HTTPS configurado (via proxy reverso)
- [ ] Documentação desabilitada em produção
- [ ] Build obfuscado aplicado

---

**Versão:** 1.0.0  
**Última Atualização:** Setembro 2025  
**Linguagem:** Node.js / Express.js  
**Banco de Dados:** PostgreSQL