const express = require('express');

// Importar todas as rotas
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const webServiceRouter = require('./webServiceRouter');
const moodleRouter = require('./moodleRouter');
const auditingRouter = require('./auditingRouter');
const templatesEmailRouter = require('./templatesEmailRouter');

// Criar router principal
const router = express.Router();

// Definir todas as rotas com seus prefixos
router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/webservice', webServiceRouter);
router.use('/moodle', moodleRouter);
router.use('/auditing', auditingRouter);
router.use('/templates-email', templatesEmailRouter);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware para rotas não encontradas da API
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota da API não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;