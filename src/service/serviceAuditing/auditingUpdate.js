const { Auditing } = require('../../database/database');
const logger = require('../../utils/logger');
const jwt = require('jsonwebtoken');

class AuditingUpdate {
  async update(id, updateData) {
    try {
      const auditing = await Auditing.findByPk(id);

      if (!auditing) {
        return {
          success: false,
          message: 'Registro de auditoria não encontrado'
        };
      }

      await auditing.update(updateData);

      logger.success(`Auditoria atualizada: ${id}`);

      return {
        success: true,
        auditing,
        message: 'Registro de auditoria atualizado com sucesso'
      };
    } catch (error) {
      logger.error(`Erro ao atualizar auditoria: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao atualizar registro de auditoria'
      };
    }
  }

  async updateUserToken(userToken) {
    try {
      logger.debug(`Buscando token na auditoria para marcação como usado`);

      // Buscar pelo token específico no campo tokenUser
      const auditing = await Auditing.findOne({
        where: {
          tokenUser: userToken
        }
      });

      if (!auditing) {
        logger.warning(`Token não encontrado na auditoria para marcação como usado`);
        return {
          success: false,
          message: 'Token não encontrado na auditoria'
        };
      }

      logger.debug(`Token encontrado na auditoria: ${auditing.id}`);

      // Verificar se token já foi usado
      if (auditing.useToken) {
        logger.warning(`Tentativa de usar token já utilizado: ${auditing.id}`);
        return {
          success: false,
          message: 'Token já foi usado anteriormente'
        };
      }

      // Verificar se token expirou pela data de expiração na auditoria
      if (auditing.tokenExpiresAt && new Date() > auditing.tokenExpiresAt) {
        logger.warning(`Token expirado na auditoria: ${auditing.id}`);
        await auditing.update({
          status: 'error',
          description: 'Token expirado - não foi usado a tempo'
        });
        return {
          success: false,
          message: 'Token expirado'
        };
      }

      // Validar token JWT (verificação adicional de segurança)
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET);
        
        // Verificar se é um token de reset
        if (decoded.type !== 'password_reset') {
          logger.error(`Token com tipo inválido encontrado: ${decoded.type}`);
          await auditing.update({
            status: 'error',
            description: 'Token inválido - tipo incorreto'
          });
          return {
            success: false,
            message: 'Token inválido para reset de senha'
          };
        }

        logger.debug(`Token JWT validado para usuário: ${decoded.username}`);

      } catch (jwtError) {
        logger.error(`Erro na validação JWT do token: ${jwtError.message}`);
        
        // Atualizar auditoria com erro JWT
        await auditing.update({
          status: 'error',
          description: `Erro JWT: ${jwtError.message}`
        });

        if (jwtError.name === 'TokenExpiredError') {
          return {
            success: false,
            message: 'Token JWT expirado'
          };
        }
        return {
          success: false,
          message: 'Token JWT inválido'
        };
      }

      // Marcar token como usado na auditoria
      await auditing.update({ 
        useToken: true,
        status: 'success',
        description: 'Token usado com sucesso para alteração de senha'
      });

      logger.success(`Token marcado como usado na auditoria: ${auditing.id}`);

      return {
        success: true,
        auditing,
        message: 'Token marcado como usado com sucesso'
      };

    } catch (error) {
      logger.error(`Erro ao marcar token como usado: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno ao marcar token como usado'
      };
    }
  }
}

module.exports = AuditingUpdate;