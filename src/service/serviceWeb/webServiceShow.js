const { WebService } = require('../../database/database');
const logger = require('../../utils/logger');

class WebServiceShow {
  async getById(id) {
    try {
      const webService = await WebService.findByPk(id);

      if (!webService) {
        return {
          success: false,
          message: 'WebService não encontrado'
        };
      }

      return {
        success: true,
        webService: webService.toJSON()
      };
    } catch (error) {
      logger.error(`Erro ao buscar WebService por ID: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar WebService'
      };
    }
  }

  async getAll() {
    try {
      const webServices = await WebService.findAll({
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        webServices: webServices.map(ws => ws.toJSON()),
        total: webServices.length
      };
    } catch (error) {
      logger.error(`Erro ao buscar WebServices: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao buscar WebServices'
      };
    }
  }

  /**
   * Lista todas as URLs dos WebServices ativos
   * @param {string} base - Tipo de retorno: 'simples' ou 'full'
   * @returns {Promise<Object>} Lista de URLs
   */
  async getAllUrls(base = 'simples') {
    try {
      const webServices = await WebService.findAll({
        where: { isActive: true },
        attributes: ['id', 'protocol', 'url', 'serviceName'],
        order: [['serviceName', 'ASC']]
      });

      if (webServices.length === 0) {
        return {
          success: true,
          urls: [],
          total: 0,
          message: 'Nenhum WebService ativo encontrado'
        };
      }

      let urls;

      if (base === 'full') {
        // Retorna URLs completas: https://ead.ceuma.br
        urls = webServices.map(ws => ({
          // id: ws.id,
          // serviceName: ws.serviceName,
          url: `${ws.protocol}://${ws.url}`,
          // simpleUrl: ws.url
        }));
      } else {
        // Retorna URLs simples: ead.ceuma.br
        urls = webServices.map(ws => ({
          // id: ws.id,
          // serviceName: ws.serviceName,
          url: ws.url,
          // protocol: ws.protocol
        }));
      }

      logger.info(`URLs listadas (${base}): ${urls.length} WebServices ativos`);

      return {
        success: true,
        urls,
        total: urls.length,
        base,
        message: `URLs dos WebServices (${base})`
      };

    } catch (error) {
      logger.error(`Erro ao listar URLs: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao listar URLs dos WebServices'
      };
    }
  }

  /**
   * Busca WebService pela URL do Moodle
   */
  async getWebServiceByUrl(moodleUrl) {
    try {
      const cleanUrl = moodleUrl.replace(/^https?:\/\//, '');

      const webService = await WebService.findOne({
        where: {
          url: cleanUrl,
          isActive: true
        }
      });

      if (!webService) {
        logger.warning(`WebService não encontrado para URL: ${cleanUrl}`);
        return {
          success: false,
          message: 'WebService não configurado para esta URL'
        };
      }

      if (!webService.token) {
        return {
          success: false,
          message: 'Token não configurado'
        };
      }

      return {
        success: true,
        data: webService
      };

    } catch (error) {
      logger.error(`Erro ao buscar WebService: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao acessar configurações'
      };
    }
  }
}

module.exports = WebServiceShow;