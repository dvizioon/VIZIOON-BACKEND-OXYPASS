const { TemplatesEmail } = require('../../database/database');
const logger = require('../../utils/logger');

class TemplatesEmailUpdate {
  async update(id, updateData) {
    try {
      const template = await TemplatesEmail.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }

      await template.update(updateData);

      logger.success(`Template atualizado: ${id}`);

      return {
        success: true,
        template,
        message: 'Template atualizado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao atualizar template: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async toggleActive(id) {
    try {
      const template = await TemplatesEmail.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }

      const newStatus = !template.isActive;
      await template.update({ isActive: newStatus });

      logger.success(`Status do template alterado: ${id} → ${newStatus ? 'Ativo' : 'Inativo'}`);

      return {
        success: true,
        template,
        message: `Template ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      };
    } catch (error) {
      logger.error(`Erro ao alternar status do template: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao alternar status do template'
      };
    }
  }

  async setAsDefault(id) {
    try {
      const template = await TemplatesEmail.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }

      // Remover default de todos os outros templates
      await TemplatesEmail.update(
        { isDefault: false },
        { 
          where: { 
            isDefault: true 
          } 
        }
      );

      // Definir este como padrão
      await template.update({ isDefault: true });

      logger.success(`Template definido como padrão: ${template.name}`);

      return {
        success: true,
        template,
        message: 'Template definido como padrão'
      };
    } catch (error) {
      logger.error(`Erro ao definir template como padrão: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao definir template como padrão'
      };
    }
  }
}

module.exports = TemplatesEmailUpdate;