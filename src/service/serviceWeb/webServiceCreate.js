const { WebService } = require('../../database/database');
const logger = require('../../utils/logger');

class WebServiceCreate {
  async create(webServiceData) {
    try {
      const webService = await WebService.create(webServiceData);
      logger.success(`WebService criado: ${webService.serviceName}`);
      
      return {
        success: true,
        webService: webService.toJSON(),
        message: 'WebService criado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao criar WebService: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = WebServiceCreate;