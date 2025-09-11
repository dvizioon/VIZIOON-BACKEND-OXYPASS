const { auditingShow, auditingCreate, auditingUpdate, auditingDelete } = require('../service/serviceAuditing/index');
const logger = require('../utils/logger');

class AuditingController {
  async create(req, res) {
    try {
      const result = await auditingCreate.create(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.success(`Auditoria criada via API: ${result.auditing.id}`);
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Erro no controller ao criar auditoria: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await auditingShow.getAll(page, limit);

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info(`Lista de auditorias solicitada via API - Página: ${page}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar auditorias: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await auditingShow.getById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.info(`Auditoria consultada via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao buscar auditoria: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await auditingUpdate.update(id, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Auditoria atualizada via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao atualizar auditoria: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await auditingDelete.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Auditoria deletada via API: ${id}`);
      res.json(result);
    } catch (error) {
      logger.error(`Erro no controller ao deletar auditoria: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new AuditingController();