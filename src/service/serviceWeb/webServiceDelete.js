const { WebService } = require('../../database/database');
const logger = require('../../utils/logger');

class WebServiceDelete {
  async delete(id) {
    try {
      const webService = await WebService.findByPk(id);
      
      if (!webService) {
        return {
          success: false,
          message: 'WebService não encontrado'
        };
      }

      const serviceName = webService.serviceName;
      await webService.destroy();
      logger.success(`WebService deletado: ${serviceName}`);
      
      return {
        success: true,
        message: 'WebService deletado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao deletar WebService: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao deletar WebService'
      };
    }
  }
}

module.exports = WebServiceDelete;