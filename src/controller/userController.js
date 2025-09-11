const { userShow } = require('../service/serviceUser/index');
const logger = require('../utils/logger');

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      logger.info(`Buscando perfil do usuário ID: ${userId}`);
      
      const result = await userShow.getUserById(userId);

      if (!result.success) {
        logger.warning(`Perfil não encontrado para usuário ID: ${userId}`);
        return res.status(404).json(result);
      }

      logger.success(`Perfil encontrado para usuário ID: ${userId}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro ao buscar perfil: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }


  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      logger.info(`Buscando todos os usuários - Página: ${page}, Limite: ${limit}`);
      
      const result = await userShow.getAllUsers(page, limit);

      if (!result.success) {
        logger.warning('Erro ao buscar usuários');
        return res.status(400).json(result);
      }

      logger.success(`Lista de usuários obtida: ${result.pagination.total} usuários encontrados (Página ${page})`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro ao buscar todos os usuários: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new UserController();