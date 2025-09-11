const { User } = require('../../database/database');
const logger = require('../../utils/logger');

class UserShowService {
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      return {
        success: true,
        user: user.toJSON()
      };
    } catch (error) {
      logger.error(`Erro ao buscar usuário por ID: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar usuário'
      };
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      return {
        success: true,
        user: user.toJSON()
      };
    } catch (error) {
      logger.error(`Erro ao buscar usuário por email: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar usuário'
      };
    }
  }

  async getAllUsers(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        success: true,
        users: rows.map(user => user.toJSON()),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error(`Erro ao buscar usuários: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar usuários'
      };
    }
  }
}

module.exports = UserShowService;