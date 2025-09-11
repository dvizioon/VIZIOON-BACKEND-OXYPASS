const { TemplatesEmail } = require('../../database/database');
// Importação direta para evitar problemas de dependência circular
const { getAllAvailableVariables } = require('../serviceMoodle/moodleVariables');
const logger = require('../../utils/logger');

class TemplatesEmailShow {
  async getAll(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await TemplatesEmail.findAndCountAll({
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        success: true,
        templates: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error(`Erro ao buscar templates: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar templates de email'
      };
    }
  }

  async getById(id) {
    try {
      const template = await TemplatesEmail.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }

      return {
        success: true,
        template
      };
    } catch (error) {
      logger.error(`Erro ao buscar template por ID: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar template'
      };
    }
  }

  async getActive() {
    try {
      const templates = await TemplatesEmail.findAll({
        where: { isActive: true },
        order: [['created_at', 'DESC']]
      });

      return {
        success: true,
        templates,
        total: templates.length
      };
    } catch (error) {
      logger.error(`Erro ao buscar templates ativos: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar templates ativos'
      };
    }
  }

  async getDefault() {
    try {
      const template = await TemplatesEmail.findOne({
        where: {
          isDefault: true,
          isActive: true
        }
      });

      if (!template) {
        return {
          success: false,
          message: 'Template padrão não encontrado'
        };
      }

      return {
        success: true,
        template
      };
    } catch (error) {
      logger.error(`Erro ao buscar template padrão: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar template padrão'
      };
    }
  }

  /**
   * Lista todas as variáveis disponíveis para templates
   * @returns {Promise<Object>} Lista de variáveis organizadas por categoria
   */
  async getAvailableVariables() {
    try {
      const variables = getAllAvailableVariables();

      return {
        success: true,
        variables,
        total: variables.length,
        message: 'Variáveis disponíveis para templates'
      };
    } catch (error) {
      logger.error(`Erro ao buscar variáveis: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar variáveis disponíveis'
      };
    }
  }
}

module.exports = TemplatesEmailShow;