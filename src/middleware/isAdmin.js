const { User } = require('../database/database');
const logger = require('../utils/logger');

/**
 * Middleware de verificação de admin
 * Deve ser usado APÓS o middleware isAuth
 * Verifica se o usuário tem privilégios de administrador
 */
const isAdmin = async (req, res, next) => {
  try {
    // Verificar se o usuário foi autenticado anteriormente
    if (!req.user || !req.userId) {
      logger.error('Middleware isAdmin chamado sem autenticação prévia');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar usuário atualizado no banco para verificar role
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      logger.warning(`Usuário não encontrado para verificação admin: ${req.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário é admin
    if (user.role !== 'admin') {
      logger.warning(`Acesso admin negado para usuário: ${user.email} (role: ${user.role})`);
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Privilégios de administrador necessários'
      });
    }

    // Atualizar dados do usuário na requisição (caso tenha mudado)
    req.user = user.toJSON();
    req.isAdmin = true;

    logger.debug(`Acesso admin autorizado para: ${user.email}`);
    next();

  } catch (error) {
    logger.error(`Erro no middleware de verificação admin: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na verificação de privilégios'
    });
  }
};

module.exports = {
  isAdmin
};