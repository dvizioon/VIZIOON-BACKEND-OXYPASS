const MoodleFindUserService = require('./moodleFindUser');
const apiClient = require('../../lib/api');
const logger = require('../../utils/logger');
const MoodleResetPasswordService = require('./moodleResetPassword');
const { auditingUpdate } = require('../serviceAuditing/index');
const { webServiceShow } = require('../serviceWeb/index');

/**
 * Serviço para atualizar usuários no Moodle
 * Usa a função core_user_update_users
 * Estende MoodleFindUserService para reutilizar funcionalidades de busca
 */
class MoodleUpdateUserService extends MoodleFindUserService {
  
  /**
   * Atualiza senha com token (método principal para trocar senha)
   * @param {string} token - Token JWT de reset
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async updatePasswordWithToken(token, newPassword) {
    try {
      logger.info(`Atualizando senha com token`);

      // Importar diretamente para evitar dependência circular
      const resetService = new MoodleResetPasswordService();

      // Validar token
      const tokenValidation = await resetService.validateResetToken(token);
      if (!tokenValidation.success) {
        return tokenValidation;
      }

      const { userId, email, username, moodleUrl } = tokenValidation.data;

      // Validar nova senha
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.success) {
        return passwordValidation;
      }

      // Atualizar senha no Moodle
      const updateResult = await this.updateUser(moodleUrl, userId, {
        password: newPassword
      });

      if (updateResult.success) {
        logger.success(`Senha atualizada com sucesso para usuário: ${username || email}`);
        
        // Marcar token como usado na auditoria
        const auditResult = await auditingUpdate.updateUserToken(token);
        if (auditResult.success) {
          logger.success(`Token marcado como usado na auditoria`);
        }

        return {
          success: true,
          message: 'Senha atualizada com sucesso',
          data: {
            userId,
            username,
            email,
            timestamp: new Date().toISOString()
          }
        };
      }

      return updateResult;

    } catch (error) {
      logger.error(`Erro na atualização de senha com token: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno na atualização de senha'
      };
    }
  }

  /**
   * Atualiza usuário no Moodle usando API nativa
   * @param {string} moodleUrl - URL do Moodle (ex: ead.ceuma.br)
   * @param {number} userId - ID do usuário no Moodle
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateUser(moodleUrl, userId, updateData) {
    try {
      logger.info(`Atualizando usuário ID: ${userId} em ${moodleUrl}`);

      // Buscar WebService pela URL
      const webServiceResult = await webServiceShow.getWebServiceByUrl(moodleUrl);
      if (!webServiceResult.success) {
        return webServiceResult;
      }

      const webService = webServiceResult.data;

      // Fazer requisição para Moodle
      const result = await this.callMoodleUpdateAPI(webService, userId, updateData);
      
      return result;

    } catch (error) {
      logger.error(`Erro ao atualizar usuário: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno na atualização do usuário'
      };
    }
  }

  /**
   * Chama a API core_user_update_users do Moodle
   * @param {Object} webService - Dados do WebService
   * @param {number} userId - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Resultado da API
   */
  async callMoodleUpdateAPI(webService, userId, updateData) {
    try {
      const baseUrl = `${webService.protocol}://${webService.url}`;
      
      // Preparar parâmetros conforme documentação do Moodle
      const params = {
        wstoken: webService.token,
        wsfunction: 'core_user_update_users',
        moodlewsrestformat: 'json',
        'users[0][id]': userId
      };

      // Adicionar campos de atualização
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null) {
          params[`users[0][${key}]`] = updateData[key];
        }
      });

      logger.debug(`Chamando Moodle Update API: ${baseUrl}${webService.route}`);
      logger.debug(`Atualizando usuário ID: ${userId}`);

      const result = await apiClient.get(baseUrl, webService.route, params);

      if (!result.success) {
        logger.error(`Falha na comunicação com Moodle: ${result.message}`);
        return {
          success: false,
          message: `Erro de comunicação: ${result.message}`
        };
      }

      // Processar resposta do Moodle
      return this.processMoodleUpdateResponse(result.data, userId, updateData);

    } catch (error) {
      logger.error(`Erro na chamada da API Moodle Update: ${error.message}`);
      return {
        success: false,
        message: 'Erro na comunicação com Moodle'
      };
    }
  }

  /**
   * Processa resposta da API de atualização do Moodle
   * @param {Object} data - Dados retornados pelo Moodle
   * @param {number} userId - ID do usuário atualizado
   * @param {Object} updateData - Dados que foram atualizados
   * @returns {Object} Resultado processado
   */
  processMoodleUpdateResponse(data, userId, updateData) {
    try {
      // Verificar se há erro de estrutura
      if (data?.errorcode) {
        logger.error(`Erro do Moodle Update: ${data.errorcode} - ${data.message}`);
        return {
          success: false,
          message: data.message || 'Erro na API de atualização do Moodle',
          errorCode: data.errorcode
        };
      }

      const warnings = data?.warnings || [];

      // Log de warnings se existirem
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          logger.warning(`Update Warning: ${warning.warningcode} - ${warning.message}`);
        });

        // Verificar se há warnings críticos
        const criticalWarnings = warnings.filter(w => 
          w.warningcode.includes('error') || 
          w.warningcode.includes('invalid')
        );

        if (criticalWarnings.length > 0) {
          return {
            success: false,
            message: 'Falha na atualização: ' + criticalWarnings[0].message,
            warnings
          };
        }
      }

      logger.success(`Usuário atualizado com sucesso: ID ${userId}`);

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: {
          userId,
          updatedFields: Object.keys(updateData),
          warnings,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error(`Erro ao processar resposta de atualização: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao processar resposta do Moodle'
      };
    }
  }

  /**
   * Valida nova senha
   * @param {string} password - Senha para validar
   * @returns {Object} Resultado da validação
   */
  validatePassword(password) {
    if (!password) {
      return {
        success: false,
        message: 'Nova senha é obrigatória'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      };
    }

    if (password.length > 200) {
      return {
        success: false,
        message: 'Senha muito longa (máximo 200 caracteres)'
      };
    }

    return {
      success: true,
      message: 'Senha válida'
    };
  }
}

module.exports = MoodleUpdateUserService;