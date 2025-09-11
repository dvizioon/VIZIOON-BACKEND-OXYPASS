// src/service/serviceWeb/webServiceUpdate.js
const { WebService } = require('../../database/database');
const logger = require('../../utils/logger');

class WebServiceUpdate {
  async update(id, updateData) {
    try {
      const webService = await WebService.findByPk(id);

      if (!webService) {
        return {
          success: false,
          message: 'WebService não encontrado'
        };
      }

      await webService.update(updateData);

      logger.success(`WebService atualizado: ${id}`);
      return {
        success: true,
        webService: webService.toJSON(),
        message: 'WebService atualizado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao atualizar WebService: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao atualizar WebService'
      };
    }
  }

  async toggleActive(id) {
    try {
      const webService = await WebService.findByPk(id);

      if (!webService) {
        return {
          success: false,
          message: 'WebService não encontrado'
        };
      }

      // alterna o valor
      const newStatus = !webService.isActive;
      await webService.update({ isActive: newStatus });

      logger.success(
        `Status do WebService alterado: ${id} → ${newStatus ? 'Ativo' : 'Inativo'}`
      );

      return {
        success: true,
        webService: webService.toJSON(),
        message: `WebService ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      };
    } catch (error) {
      logger.error(`Erro ao alternar status do WebService: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao alternar status do WebService'
      };
    }
  }
}

module.exports = WebServiceUpdate;
