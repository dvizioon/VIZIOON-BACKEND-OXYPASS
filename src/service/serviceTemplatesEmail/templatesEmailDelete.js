const { TemplatesEmail } = require('../../database/database');
const logger = require('../../utils/logger');

class TemplatesEmailDelete {
  async delete(id) {
    try {
      const template = await TemplatesEmail.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }

      // Verificar se é template padrão
      if (template.isDefault) {
        return {
          success: false,
          message: 'Não é possível deletar um template padrão. Defina outro como padrão primeiro.'
        };
      }

      const templateName = template.name;
      await template.destroy();

      logger.success(`Template deletado: ${templateName}`);

      return {
        success: true,
        message: 'Template deletado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao deletar template: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao deletar template'
      };
    }
  }
}

module.exports = TemplatesEmailDelete;