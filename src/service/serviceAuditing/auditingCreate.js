const { Auditing } = require('../../database/database');
const logger = require('../../utils/logger');

class AuditingCreate {
  async create(auditingData) {
    try {
      const auditing = await Auditing.create(auditingData);
      
      logger.success(`Registro de auditoria criado: ${auditing.id}`);

      return {
        success: true,
        auditing,
        message: 'Registro de auditoria criado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao criar registro de auditoria: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao criar registro de auditoria'
      };
    }
  }
}

module.exports = AuditingCreate;