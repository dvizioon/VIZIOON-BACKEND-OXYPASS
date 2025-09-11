const { Auditing } = require('../../database/database');
const logger = require('../../utils/logger');

class AuditingDelete {
  async delete(id) {
    try {
      const auditing = await Auditing.findByPk(id);

      if (!auditing) {
        return {
          success: false,
          message: 'Registro de auditoria não encontrado'
        };
      }

      await auditing.destroy();

      logger.success(`Auditoria deletada: ${id}`);

      return {
        success: true,
        message: 'Registro de auditoria deletado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao deletar auditoria: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao deletar registro de auditoria'
      };
    }
  }
}

module.exports = AuditingDelete;