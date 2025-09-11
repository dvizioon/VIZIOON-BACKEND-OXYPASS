const { User } = require('../database/database');
const { verifyToken } = require('./tokenMiddleware');
const logger = require('../utils/logger');

/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado e se existe no banco
 */
const isAuth = async (req, res, next) => {
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
    
    // Verificar token
    const tokenResult = await verifyToken(token);
    
    if (!tokenResult.success) {
      return res.status(401).json({
        success: false,
        message: tokenResult.message
      });
    }

    // Buscar usuário no banco
    const user = await User.findByPk(tokenResult.decoded.id);
    
    if (!user) {
      logger.warning(`Usuário não encontrado no banco para ID: ${tokenResult.decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se dados do token ainda são válidos
    if (user.email !== tokenResult.decoded.email) {
      logger.warning(`Email do token não confere: token=${tokenResult.decoded.email}, banco=${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = user.toJSON();
    req.token = token;
    req.userId = user.id;
    req.decoded = tokenResult.decoded;

    logger.debug(`Usuário autenticado: ${user.email} (ID: ${user.id})`);
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
  isAuth
};