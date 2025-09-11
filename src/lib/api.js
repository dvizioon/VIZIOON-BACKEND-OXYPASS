const axios = require('axios');
const https = require('https');
const logger = require('../utils/logger');

/**
 * Cliente simples para requisições ao Moodle
 */
class ApiClient {
  constructor() {
    this.timeout = 30000;
    
    // Configurar agent HTTPS para aceitar certificados auto-assinados
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false // Para certificados SSL problemáticos
    });
  }

  /**
   * Faz requisição GET para Moodle WebService
   */
  async get(baseUrl, route, params) {
    try {
      const fullUrl = `${baseUrl}${route}`;
      
      logger.debug(`Requisição: ${fullUrl}`);

      const response = await axios.get(fullUrl, {
        params: { moodlewsrestformat: 'json', ...params },
        timeout: this.timeout,
        httpsAgent: this.httpsAgent,
        headers: {
          'User-Agent': 'OxyPass-API/1.0'
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      logger.error(`Erro na requisição: ${error.message}`);
      
      // Log mais detalhado do erro
      if (error.response) {
        logger.error(`Status: ${error.response.status}`);
        logger.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro na comunicação'
      };
    }
  }
}

module.exports = new ApiClient();