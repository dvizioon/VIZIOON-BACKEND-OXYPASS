const { Auditing } = require('../../database/database');
const logger = require('../../utils/logger');
const jwt = require('jsonwebtoken');

class AuditingShow {
  async getAll(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await Auditing.findAndCountAll({
        include: [
          { association: 'webService' },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        success: true,
        auditing: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error(`Erro ao buscar auditorias: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar registros de auditoria'
      };
    }
  }

  async getById(id) {
    try {
      const auditing = await Auditing.findByPk(id, {
        include: [
          { association: 'webService' },
          { association: 'user' }
        ]
      });

      if (!auditing) {
        return {
          success: false,
          message: 'Registro de auditoria não encontrado'
        };
      }

      return {
        success: true,
        auditing
      };
    } catch (error) {
      logger.error(`Erro ao buscar auditoria por ID: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar registro de auditoria'
      };
    }
  }

  /**
   * Buscar se token está sendo usado
   * @param {string} token - Token para verificar
   * @returns {Promise<Object>} Status do token
   */
  async getByTokenStatus(token) {
    try {
      if (!token) {
        return { success: false, message: 'Token é obrigatório' };
      }

      const auditing = await Auditing.findOne({
        where: { tokenUser: token }
      });

      if (!auditing) {
        return { success: false, message: 'Token não encontrado' };
      }

      if (auditing.useToken) {
        return { success: false, message: 'Token já foi usado, ou está expirado' };
      }

      // if (auditing.tokenExpiresAt && new Date() > auditing.tokenExpiresAt) {
      //   return { success: false, message: 'Token expirado' };
      // }

      return { success: true, message: 'Token válido' };

    } catch (error) {
      logger.error(`Erro ao verificar token: ${error.message}`);
      return { success: false, message: 'Erro interno' };
    }
  }
}

module.exports = AuditingShow;