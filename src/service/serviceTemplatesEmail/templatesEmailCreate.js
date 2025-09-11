const { TemplatesEmail } = require('../../database/database');
const logger = require('../../utils/logger');

class TemplatesEmailCreate {
  async create(templateData) {
    try {
      const template = await TemplatesEmail.create(templateData);
      
      logger.success(`Template de email criado: ${template.name}`);

      return {
        success: true,
        template,
        message: 'Template de email criado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao criar template de email: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = TemplatesEmailCreate;