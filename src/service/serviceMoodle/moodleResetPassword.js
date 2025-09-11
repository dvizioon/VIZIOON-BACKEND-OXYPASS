const MoodleFindUserService = require('./moodleFindUser');
const apiClient = require('../../lib/api');
const logger = require('../../utils/logger');
const jwt = require('jsonwebtoken');
const { emailSend } = require('../serviceEmail/index');
const { webServiceShow } = require('../serviceWeb/index');
const { auditingCreate, auditingUpdate, auditingShow } = require('../serviceAuditing/index');
const { templatesEmailShow } = require('../serviceTemplatesEmail/index');
const { extractUserVariables, replaceVariables } = require('./moodleVariables');
const authConfig = require('../../config/auth');
const { parseExpirationToMs } = require('../../helpers/timeHelpers');

/**
 * Serviço para reset de senha de usuários no Moodle
 * Estende MoodleFindUserService para reutilizar funcionalidades de busca
 */
class MoodleResetPasswordService extends MoodleFindUserService {

  /**
   * Solicita reset de senha para um usuário
   * @param {string} moodleUrl - URL do Moodle (ex: ead.ceuma.br)
   * @param {Object} searchData - Objeto com email OU username
   * @param {Object} requestInfo - Informações da requisição (IP, userAgent)
   * @returns {Promise<Object>} Resultado da operação
   */
  async requestPasswordReset(moodleUrl, searchData, requestInfo = {}) {
    let auditingId = null;

    try {
      logger.info(`Iniciando processo de reset de senha em ${moodleUrl}`);

      // Primeiro, buscar o usuário para validar se existe
      const userResult = await this.findUserByUrl(moodleUrl, searchData);

        if (!userResult.success) {
        // Criar registro de auditoria para tentativa falhada
        const auditResult = await auditingCreate.create({
          userId: null, // Não temos ID do usuário pois não foi encontrado
          username: searchData.username || null,
          email: searchData.email || null,
          webServiceId: null,
          tokenUser: null, // Não há token pois falhou
          useToken: false,
          emailSent: false,
          tokenExpiresAt: null,
          status: 'error',
          description: 'Usuário não encontrado para reset de senha',
        });

        // SEGURANÇA: Não revelar se usuário existe ou não
        // Sempre retornar sucesso para evitar enumeração de usuários
        logger.warning(`Usuário não encontrado para reset, mas retornando sucesso por segurança`);
        
        return {
          success: true,
          message: 'Se o usuário existir, um email de reset de senha será enviado',
          timestamp: new Date().toISOString()
        };

        // CÓDIGO COMENTADO - Anterior que revelava se usuário existia
        // return {
        //   success: false,
        //   message: 'Usuário não encontrado para reset de senha',
        //   details: userResult.message
        // };
      }

      const user = userResult.user;
      logger.debug(`Usuário encontrado: ${JSON.stringify(user)}`);

      // Buscar webService pelo URL
      const webServiceResult = await webServiceShow.getWebServiceByUrl(moodleUrl);
      const webServiceId = webServiceResult.success ? webServiceResult.data.id : null;

      // Verificar se usuário não está suspenso
      if (user.suspended) {
        logger.warning(`Tentativa de reset para usuário suspenso: ${user.username}`);

        // Criar registro de auditoria para suspensão
        await auditingCreate.create({
          userId: user.id, // ID do usuário do Moodle
          username: user.username,
          email: user.email,
          webServiceId: webServiceId,
          tokenUser: null, // Não há token pois foi rejeitado
          useToken: false,
          emailSent: false,
          tokenExpiresAt: null,
          status: 'error',
          description: 'Usuário suspenso não pode solicitar reset de senha',
        });

        return {
          success: false,
          message: 'Usuário suspenso não pode solicitar reset de senha'
        };
      }

      // Verificar se usuário está confirmado (comentado conforme solicitação)
      // if (!user.confirmed) {
      //   logger.warning(`Tentativa de reset para usuário não confirmado: ${user.username}`);
      //   
      //   // Criar registro de auditoria para usuário não confirmado
      //   await auditingCreate.create({
      //     userId: user.id, // ID do usuário do Moodle
      //     username: user.username,
      //     email: user.email,
      //     webServiceId: webServiceId,
      //     tokenUser: null, // Não há token pois foi rejeitado
      //     useToken: false,
      //     emailSent: false,
      //     tokenExpiresAt: null,
      //     status: 'error',
      //     description: 'Usuário não confirmado não pode solicitar reset de senha',
      //   });
      //
      //   return {
      //     success: false,
      //     message: 'Usuário não confirmado não pode solicitar reset de senha'
      //   };
      // }

      logger.info(`Usuário validado para reset: ${user.fullname} (${user.email})`);

      // Gerar token JWT temporário
      const resetToken = this.generateResetToken(user, moodleUrl);
      const tokenExpiresAt = new Date(Date.now() + parseExpirationToMs(authConfig.reset.expiresIn)); // 5 minutos
      logger.debug(`Token gerado: ${resetToken}`);

      // Criar registro de auditoria inicial
      const auditResult = await auditingCreate.create({
        userId: user.id, // ID do usuário do Moodle
        username: user.username,
        email: user.email,
        webServiceId: webServiceId,
        tokenUser: resetToken, // Token JWT gerado
        useToken: false,
        emailSent: false,
        tokenExpiresAt: tokenExpiresAt,
        status: 'pending',
        description: 'Reset de senha iniciado',
      });

      if (auditResult.success) {
        auditingId = auditResult.auditing.id;
      }

      // Enviar email com token
      const emailResult = await this.sendResetEmail(user, resetToken, moodleUrl);

      if (!emailResult.success) {
        // Atualizar auditoria como falha no envio do email
        if (auditingId) {
          await auditingUpdate.update(auditingId, {
            status: 'error',
            description: 'Falha no envio do email',
            emailSent: false
          });
        }
        return emailResult;
      }

      // Atualizar auditoria como email enviado com sucesso
      if (auditingId) {
        await auditingUpdate.update(auditingId, {
          status: 'success',
          description: 'Email enviado com sucesso',
          emailSent: true
        });
      }

      logger.success(`Reset de senha solicitado para: ${user.fullname}`);

      return {
        success: true,
        message: 'Email de reset enviado com sucesso',
        user: {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email
        },
        resetInfo: {
          timestamp: new Date().toISOString(),
          method: 'email',
          status: 'enviado',
          expiresIn: authConfig.reset.expiresInHuman,
          auditingId: auditingId
        }
      };

    } catch (error) {
      logger.error(`Erro no processo de reset de senha: ${error.message}`);

      // Registrar erro na auditoria se possível
      if (auditingId) {
        await auditingUpdate.update(auditingId, {
          status: 'error',
          description: error.message
        });
      }

      return {
        success: false,
        message: 'Erro interno no processo de reset de senha'
      };
    }
  }

  /**
   * Marca token como usado na auditoria
   * @param {string} token - Token JWT usado
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async markTokenAsUsed(token) {
    try {
      // Usar o método updateUserToken que busca pelo token diretamente
      const result = await auditingUpdate.updateUserToken(token);

      if (result.success) {
        logger.info(`Token marcado como usado na auditoria`);
        return true;
      } else {
        logger.warning(`Falha ao marcar token como usado: ${result.message}`);
        return false;
      }

    } catch (error) {
      logger.error(`Erro ao marcar token como usado: ${error.message}`);
      return false;
    }
  }

  /**
   * Gera token JWT temporário para reset de senha
   * @param {Object} user - Dados do usuário
   * @param {string} moodleUrl - URL do Moodle
   * @returns {string} Token JWT
   */
  generateResetToken(user, moodleUrl) {
    try {
      const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        moodleUrl,
        type: 'password_reset',
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET, {
        expiresIn: authConfig.reset.expiresIn
      });

      logger.debug(`Token de reset gerado para usuário: ${user.username}`);
      return token;

    } catch (error) {
      logger.error(`Erro ao gerar token de reset: ${error.message}`);
      throw new Error('Falha ao gerar token de reset');
    }
  }

  /**
   * Valida token de reset de senha
   * @param {string} token - Token JWT para validar
   * @returns {Object} Resultado da validação
   */
  // validateResetToken(token) {
  //   try {
  //     if (!token) {
  //       return {
  //         success: false,
  //         message: 'Token é obrigatório'
  //       };
  //     }

  //     const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET);

  //     // Verificar se é um token de reset
  //     if (decoded.type !== 'password_reset') {
  //       return {
  //         success: false,
  //         message: 'Token inválido para reset de senha'
  //       };
  //     }

  //     logger.info(`Token de reset validado para usuário: ${decoded.username}`);

  //     return {
  //       success: true,
  //       message: 'Token válido',
  //       data: {
  //         userId: decoded.userId,
  //         username: decoded.username,
  //         email: decoded.email,
  //         moodleUrl: decoded.moodleUrl,
  //         timestamp: decoded.timestamp
  //       }
  //     };

  //   } catch (error) {
  //     logger.warning(`Token de reset inválido ou expirado: ${error.message}`);

  //     if (error.name === 'TokenExpiredError') {
  //       return {
  //         success: false,
  //         message: 'Token expirado. Solicite um novo reset de senha.'
  //       };
  //     }

  //     return {
  //       success: false,
  //       message: 'Token inválido'
  //     };
  //   }
  // }

  /**
   * Valida token de reset de senha
   * @param {string} token - Token JWT para validar
   * @returns {Object} Resultado da validação
   */
  async validateResetToken(token) {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Token é obrigatório'
        };
      }

      // Usar o auditingShow que já foi importado no topo
      const auditingCheck = await auditingShow.getByTokenStatus(token);

      if (!auditingCheck.success) {
        return {
          success: false,
          message: auditingCheck.message
        };
      }

      // Se passou na auditoria, validar JWT
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET);

      // Verificar se é um token de reset
      if (decoded.type !== 'password_reset') {
        return {
          success: false,
          message: 'Token inválido para reset de senha'
        };
      }

      logger.info(`Token de reset validado para usuário: ${decoded.username}`);

      return {
        success: true,
        message: 'Token válido',
        data: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          moodleUrl: decoded.moodleUrl,
          timestamp: decoded.timestamp
        }
      };

    } catch (error) {
      logger.warning(`Token de reset inválido ou expirado: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          message: 'Token expirado. Solicite um novo reset de senha.'
        };
      }

      return {
        success: false,
        message: 'Token inválido'
      };
    }
  }


  /**
   * Envia email com link de reset
   * @param {Object} user - Dados do usuário
   * @param {string} resetToken - Token de reset
   * @param {string} moodleUrl - URL do Moodle
   * @returns {Promise<Object>} Resultado do envio
   */
  // async sendResetEmail(user, resetToken, moodleUrl) {
  //   try {
  //     // URL para reset (pode ser configurada via env)
  //     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  //     const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  //     // Usar a função do EmailService
  //     const resetData = {
  //       email: user.email,
  //       nome: user.fullname,
  //       resetLink
  //     };

  //     logger.info(`Enviando email de reset para: ${user.email}`);

  //     const result = await emailSend.sendPasswordResetEmail(resetData);

  //     if (result.success) {
  //       logger.success(`Email de reset enviado para: ${user.email}`);
  //     } else {
  //       logger.error(`Falha ao enviar email de reset: ${result.message}`);
  //     }

  //     return result;

  //   } catch (error) {
  //     logger.error(`Erro ao enviar email de reset: ${error.message}`);
  //     return {
  //       success: false,
  //       message: 'Erro ao enviar email de reset'
  //     };
  //   }
  // }

  /**
   * Envia email com link de reset usando templates
   * @param {Object} user - Dados do usuário
   * @param {string} resetToken - Token de reset
   * @param {string} moodleUrl - URL do Moodle
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendResetEmail(user, resetToken, moodleUrl) {
    try {
      // URL para reset (pode ser configurada via env)
      // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      // const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')             
        .map(url => url.trim());

      const frontendUrl = frontendUrls[0]; // pega a primeira URL
      const resetLink = `${frontendUrl}/${process.env.RESET_PASSWORD_PATH || 'reset-password?token'}=${resetToken}`;


      // Buscar webService para obter dados completos
      const webServiceResult = await webServiceShow.getWebServiceByUrl(moodleUrl);
      const webServiceData = webServiceResult.success ? webServiceResult.data : {};

      // Extrair variáveis do usuário
      const templateVariables = extractUserVariables(
        user,
        { serviceName: webServiceData.serviceName, url: webServiceData.url },
        {
          resetLink,
          resetToken: resetToken,
          expirationTime: authConfig.reset.expiresInHuman
        }
      );

      // Buscar template padrão
      const templateResult = await templatesEmailShow.getDefault();

      if (!templateResult.success) {
        logger.error(`Template padrão não encontrado: ${templateResult.message}`);
        return {
          success: false,
          message: 'Template de email não configurado'
        };
      }

      // Usar template do banco
      const template = templateResult.template;

      // Substituir variáveis no template
      const emailSubject = replaceVariables(template.subject, templateVariables);
      const emailContent = replaceVariables(template.content, templateVariables);

      logger.info(`Usando template: ${template.name}`);

      // Dados para envio do email
      const emailData = {
        email: user.email,
        assunto: emailSubject,
        mensagem: emailContent
      };

      logger.info(`Enviando email de reset para: ${user.email}`);

      const result = await emailSend.sendCustomEmail(emailData);

      if (result.success) {
        logger.success(`Email de reset enviado para: ${user.email}`);
      } else {
        logger.error(`Falha ao enviar email de reset: ${result.message}`);
      }

      return result;

    } catch (error) {
      logger.error(`Erro ao enviar email de reset: ${error.message}`);
      return {
        success: false,
        message: 'Erro ao enviar email de reset'
      };
    }
  }

  /**
   * Valida dados de entrada para reset de senha
   * @param {Object} searchData - Dados de busca do usuário
   * @returns {Object} Resultado da validação
   */
  validateResetData(searchData) {
    if (!searchData.email && !searchData.username) {
      return {
        success: false,
        message: 'Informe email ou username para reset de senha'
      };
    }

    if (searchData.email && searchData.username) {
      return {
        success: false,
        message: 'Informe apenas email OU username para reset'
      };
    }

    // Validação básica de email se fornecido
    if (searchData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(searchData.email)) {
        return {
          success: false,
          message: 'Formato de email inválido'
        };
      }
    }

    // Validação básica de username se fornecido
    if (searchData.username) {
      if (searchData.username.length < 2) {
        return {
          success: false,
          message: 'Username deve ter pelo menos 2 caracteres'
        };
      }
    }

    return {
      success: true,
      message: 'Dados válidos'
    };
  }

  /**
   * Verifica se um usuário pode solicitar reset de senha
   * @param {Object} user - Dados do usuário
   * @returns {Object} Resultado da verificação
   */
  canRequestReset(user) {
    if (user.suspended) {
      return {
        canReset: false,
        reason: 'Usuário está suspenso'
      };
    }

    // Verificação de confirmado comentada conforme solicitação
    // if (!user.confirmed) {
    //   return {
    //     canReset: false,
    //     reason: 'Usuário não está confirmado'
    //   };
    // }

    if (!user.email || user.email.trim().length === 0) {
      return {
        canReset: false,
        reason: 'Usuário não possui email válido'
      };
    }

    return {
      canReset: true,
      reason: 'Usuário elegível para reset'
    };
  }
}

module.exports = MoodleResetPasswordService;