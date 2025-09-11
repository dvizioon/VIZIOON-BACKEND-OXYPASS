const { 
  webServiceShow, 
  webServiceCreate, 
  webServiceUpdate, 
  webServiceDelete 
} = require('../service/serviceWeb/index');
const logger = require('../utils/logger');

class WebServiceController {
  async create(req, res) {
    try {
      const { protocol, url, token, moodleUser, moodlePassword, serviceName, route } = req.body;

      // Validar apenas os 4 campos obrigatórios
      if (!url || !serviceName || !token || !protocol) {
        logger.warning('Tentativa de criar WebService com dados obrigatórios faltando');
        return res.status(400).json({
          success: false,
          message: 'URL, token, serviceName e protocol são obrigatórios'
        });
      }

      const result = await webServiceCreate.create({
        protocol,
        url,
        token,
        moodleUser,
        moodlePassword,
        serviceName,
        route
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.success(`WebService criado via API: ${result.webService.serviceName}`);
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Erro no controller ao criar WebService: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getAll(req, res) {
    try {
      const result = await webServiceShow.getAll();

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info('Lista de WebServices solicitada via API');
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar WebServices: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await webServiceShow.getById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.info(`WebService consultado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar WebService: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await webServiceUpdate.update(id, updateData);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`WebService atualizado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao atualizar WebService: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await webServiceDelete.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`WebService deletado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao deletar WebService: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await webServiceUpdate.toggleActive(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Status do WebService alterado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao alterar status: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new WebServiceController();