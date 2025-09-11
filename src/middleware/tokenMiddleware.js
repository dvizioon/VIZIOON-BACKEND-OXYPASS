const jwt = require('jsonwebtoken');
const { User } = require('../database/database');
const logger = require('../utils/logger');

/**
 * Método para verificar token e buscar usuário no banco
 * @param {string} token - Token JWT para verificar
 * @returns {Object} - Resultado da verificação
 */
const verifyToken = async (token) => {
  try {
    // Decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`Token decodificado para usuário ID: ${decoded.id}`);

    // Buscar usuário no banco
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      logger.warning(`Usuário não encontrado no banco para ID: ${decoded.id}`);
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }

    // Verificar se os dados do token ainda são válidos
    if (user.email !== decoded.email) {
      logger.warning(`Email do token não confere: token=${decoded.email}, banco=${user.email}`);
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }

    return {
      success: true,
      user: user.toJSON(),
      userId: user.id,
      decoded
    };

  } catch (error) {
    logger.warning(`Token inválido: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        message: 'Token expirado'
      };
    }
    
    return {
      success: false,
      message: 'Credenciais inválidas'
    };
  }
};

/**
 * Middleware de autenticação para rotas protegidas
 * Verifica o token JWT e adiciona dados do usuário à requisição
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warning('Tentativa de acesso sem token válido');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido ou formato inválido'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Usar o método verifyToken
    const result = await verifyToken(token);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Adicionar dados do usuário à requisição
    req.user = result.user;
    req.token = token;
    req.userId = result.userId;
    req.decoded = result.decoded;

    logger.debug(`Usuário autenticado: ${result.user.email} (ID: ${result.userId})`);
    next();

  } catch (error) {
    logger.error(`Erro no middleware de autenticação: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação'
    });
  }
};


module.exports = {
  authMiddleware,
  verifyToken,
};