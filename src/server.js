const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importar database e logger
const { connectDatabase, closeDatabase } = require('./database/database');
const logger = require('./utils/logger');

// Importar todas as rotas centralizadas
const router = require('./router/index');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração dinâmica do CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);

    // Pegar URLs permitidas do .env
    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];

    // Verificar se a origin está nas permitidas ou se é * (permitir tudo)
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'] 
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log para todas as requisições
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`;

    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warning(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
});

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${process.env.NAME_SERVICE || 'OxyPass'}`,
      version: `${process.env.DOC_VERSION || '0.0.1'}`,
      description: 'API para reset de senhas e gerenciamento de usuários e webservices.',
      contact: {
        name: 'API Support',
        url: process.env.BACKEND_URL || `http://localhost:${PORT}`
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || `http://localhost:${PORT}`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor de produção' : 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Digite: Bearer {seu_token_jwt}'
        }
      }
    }
  },
  apis: [`${process.env.NODE_ENV === 'development' ? './src/router/*.js' : './dist/router/*.js'}`]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Documentação Swagger

if (process.env.DOC_ACTIVE === 'true') {
  app.use(process.env.DOCUMENTATION_URL || '/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: `${process.env.NAME_SERVICE || 'OxyPass'} API Docs`,
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
    customfavIcon: '/favicon.ico'
  }));
}


// Usar todas as rotas centralizadas
app.use('/api', router);

// Rota principal
app.get('/', (req, res) => {
  logger.info('Rota principal acessada');

  res.json({
    ms: `${process.env.NAME_SERVICE || 'OxyPass'}`,
    version: `${process.env.DOC_VERSION || '0.0.1'}`,
  });
});

// // Middleware de erro global
// app.use((err, req, res, next) => {
//   logger.error(`Erro no servidor: ${err.message}`);

//   const errorResponse = {
//     success: false,
//     error: 'Erro interno do servidor',
//     timestamp: new Date().toISOString()
//   };

//   // Adicionar detalhes do erro apenas em desenvolvimento
//   if (process.env.NODE_ENV === 'development') {
//     errorResponse.details = err.message;
//     errorResponse.stack = err.stack;
//   }

//   res.status(err.status || 500).json(errorResponse);
// });

// // Middleware para rotas não encontradas
// app.use('*', (req, res) => {
//   logger.warning(`Rota não encontrada: ${req.method} ${req.originalUrl}`);

//   res.status(404).json({
//     success: false,
//     error: 'Rota não encontrada',
//     message: `A rota ${req.method} ${req.originalUrl} não existe`,
//     timestamp: new Date().toISOString()
//   });
// });

// Inicializar servidor
const startServer = async () => {
  try {
    logger.info('Iniciando servidor OxyPass...');

    // Conectar ao banco de dados
    const connected = await connectDatabase();

    if (!connected) {
      logger.error('Falha ao conectar com o banco de dados');
      process.exit(1);
    }

    // Iniciar servidor
    const server = app.listen(PORT, `${process.env.HOST || '0.0.0.0'}`, () => {
      logger.success(`Servidor rodando na porta ${PORT}`);
      logger.info(`URL do backend: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      logger.info(`Documentação: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/docs`);
      logger.info(`Health Check: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/health`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS configurado para: ${process.env.FRONTEND_URL || 'localhost:3000,localhost:5173'}`);
    });

    // Configurar timeouts
    server.timeout = 30000; // 30 segundos
    server.keepAliveTimeout = 65000; // 65 segundos

  } catch (error) {
    logger.error(`Erro ao iniciar servidor: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Sinal ${signal} recebido. Encerrando servidor...`);

  try {
    await closeDatabase();
    logger.success('Banco de dados desconectado');

    process.exit(0);
  } catch (error) {
    logger.error(`Erro no shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Capturar sinais de encerramento
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

startServer();