const { 
  templatesEmailShow, 
  templatesEmailCreate, 
  templatesEmailUpdate, 
  templatesEmailDelete 
} = require('../service/serviceTemplatesEmail/index');
const logger = require('../utils/logger');

class TemplatesEmailController {
  async create(req, res) {
    try {
      const { name, description, subject, content, type, isActive, isDefault } = req.body;

      if (!name || !subject || !content) {
        logger.warning('Tentativa de criar template com dados obrigatórios faltando');
        return res.status(400).json({
          success: false,
          message: 'Nome, assunto e conteúdo são obrigatórios'
        });
      }

      const result = await templatesEmailCreate.create({
        name,
        description,
        subject,
        content,
        type,
        isActive,
        isDefault
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.success(`Template de email criado via API: ${result.template.name}`);
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Erro no controller ao criar template: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await templatesEmailShow.getAll(page, limit);

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info(`Lista de templates solicitada via API - Página: ${page}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar templates: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await templatesEmailShow.getById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.info(`Template consultado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar template: ${error.message}`);
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

      const result = await templatesEmailUpdate.update(id, updateData);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Template atualizado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao atualizar template: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await templatesEmailDelete.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Template deletado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao deletar template: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await templatesEmailUpdate.toggleActive(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Status do template alterado via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao alterar status: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async setAsDefault(req, res) {
    try {
      const { id } = req.params;
      const result = await templatesEmailUpdate.setAsDefault(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Template definido como padrão via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao definir template padrão: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getVariables(req, res) {
    try {
      const result = await templatesEmailShow.getAvailableVariables();

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info('Variáveis de templates solicitadas via API');
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar variáveis: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getVariables(req, res) {
    try {
      const result = await templatesEmailShow.getAvailableVariables();

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info('Variáveis de templates solicitadas via API');
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar variáveis: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new TemplatesEmailController();