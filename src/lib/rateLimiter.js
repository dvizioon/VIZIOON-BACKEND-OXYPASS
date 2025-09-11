const rateLimit = require('express-rate-limit');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');

/**
 * Rate limiter para reset de senha
 * Previne ataques de força bruta
 */
const resetPasswordLimiter = rateLimit({
  windowMs: authConfig.rateLimit.windowMs, // janela de tempo
  max: authConfig.rateLimit.max, // máximo de tentativas
  message: {
    success: false,
    message: authConfig.rateLimit.message || 'Muitas tentativas. Tente novamente mais tarde.',
    retryAfter: Math.ceil(authConfig.rateLimit.windowMs / 1000 / 60) // em minutos
  },
  standardHeaders: true, // Retorna rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  
  // Função personalizada para logging
  onLimitReached: (req, res, options) => {
    const ip = req.ip || req.connection.remoteAddress;
    logger.warning(`Rate limit atingido para IP: ${ip} na rota reset-password`);
  },

  // Chave personalizada (pode incluir mais que só IP)
  keyGenerator: (req) => {
    return req.ip; // Pode usar req.headers['x-forwarded-for'] se estiver atrás de proxy
  },

  // Pular certas condições (opcional)
  skip: (req) => {
    // Exemplo: pular para IPs de whitelist
    const whitelistIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelistIPs.includes(req.ip);
  }
});

/**
 * Rate limiter para login
 * Mais restritivo que reset de senha
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  onLimitReached: (req, res, options) => {
    const ip = req.ip;
    const email = req.body?.email || 'unknown';
    logger.warning(`Rate limit de login atingido para IP: ${ip}, email: ${email}`);
  }
});

/**
 * Rate limiter geral para API
 * Proteção contra spam geral
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  resetPasswordLimiter,
  loginLimiter,
  generalApiLimiter
};