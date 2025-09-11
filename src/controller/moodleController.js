const { url } = require('zod');
const { moodleFindUser, moodleResetPassword, moodleUpdateUser } = require('../service/serviceMoodle');
const { webServiceShow } = require('../service/serviceWeb/index'); // Importando aqui
const logger = require('../utils/logger');

class MoodleController {

  /**
   * Lista URLs dos WebServices ativos
   * GET /api/moodle/urls?base=simples|full
   */
  async getUrls(req, res) {
    try {
      const { base = 'simples' } = req.query;

      // Validar parâmetro base
      if (!['simples', 'full'].includes(base)) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro "base" deve ser "simples" ou "full"'
        });
      }

      logger.info(`Listando URLs dos WebServices (base: ${base})`);

      const result = await webServiceShow.getAllUrls(base);

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.success(`URLs listadas: ${result.total} WebServices encontrados`);
      res.json(result);

    } catch (error) {
      logger.error(`Erro no controller ao listar URLs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca usuário no Moodle por URL e email ou username
   * POST /api/moodle/find-user
   */
  async findUser(req, res) {
    try {
      const { moodleUrl, email, username } = req.body;

      // Validações
      if (!moodleUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL do Moodle é obrigatória'
        });
      }

      // Verificar se foi informado email ou username
      if (!email && !username) {
        return res.status(400).json({
          success: false,
          message: 'Informe email ou username'
        });
      }

      // Verificar se não foi informado ambos
      if (email && username) {
        return res.status(400).json({
          success: false,
          message: 'Informe apenas email OU username, não ambos'
        });
      }

      const searchData = { email, username };
      const searchField = email ? 'email' : 'username';
      const searchValue = email || username;

      logger.info(`Busca de usuário via API: ${searchField}=${searchValue} em ${moodleUrl}`);

      const result = await moodleFindUser.findUserByUrl(moodleUrl, searchData);

      if (!result.success) {
        return res.status(404).json(result);
      }

      logger.success(`Usuário encontrado via API: ${result.user.fullname}`);
      res.json(result);

    } catch (error) {
      logger.error(`Erro no controller: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // /**
  //  * Solicita reset de senha para usuário (ROTA PÚBLICA)
  //  * POST /api/moodle/reset-password
  //  */
  // async resetPassword(req, res) {
  //   try {
  //     const { moodleUrl, email, username } = req.body;

  //     // Validações básicas
  //     if (!moodleUrl) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'URL do Moodle é obrigatória'
  //       });
  //     }

  //     const searchData = { email, username };

  //     // Validar dados de entrada
  //     const validation = moodleResetPassword.validateResetData(searchData);
  //     if (!validation.success) {
  //       return res.status(400).json(validation);
  //     }

  //     const searchField = email ? 'email' : 'username';
  //     const searchValue = email || username;

  //     logger.info(`Reset de senha solicitado via API pública: ${searchField}=${searchValue} em ${moodleUrl}`);

  //     // Preparar informações da requisição para auditoria
  //     const requestInfo = {
  //       userId: req.user?.id || null, // Se tiver usuário autenticado
  //       requestIp: req.ip,
  //       userAgent: req.get('User-Agent')
  //     };

  //     // Processar reset de senha com auditoria
  //     const result = await moodleResetPassword.requestPasswordReset(
  //       moodleUrl,
  //       searchData,
  //       requestInfo
  //     );

  //     if (!result.success) {
  //       return res.status(404).json(result);
  //     }

  //     logger.success(`Reset de senha processado para: ${result.user.fullname}`);

  //     // Resposta de sucesso sem expor dados sensíveis
  //     res.json({
  //       success: true,
  //       message: 'Se o usuário existir, um email de reset de senha será enviado',
  //       timestamp: new Date().toISOString(),
  //       // auditingId: result.resetInfo?.auditingId // Incluir ID da auditoria na resposta
  //     });

  //   } catch (error) {
  //     logger.error(`Erro no reset de senha: ${error.message}`);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Erro interno do servidor'
  //     });
  //   }
  // }


  /**
 * Solicita reset de senha para usuário (ROTA PÚBLICA)
 * POST /api/moodle/reset-password
 */
  async resetPassword(req, res) {
    try {
      const { moodleUrl, email, username } = req.body;

      // Validações básicas
      if (!moodleUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL do Moodle é obrigatória'
        });
      }

      const searchData = { email, username };

      // Validar dados de entrada
      const validation = moodleResetPassword.validateResetData(searchData);
      if (!validation.success) {
        return res.status(400).json(validation);
      }

      const searchField = email ? 'email' : 'username';
      const searchValue = email || username;

      logger.info(`Reset de senha solicitado via API pública: ${searchField}=${searchValue} em ${moodleUrl}`);

      // Preparar informações da requisição para auditoria
      const requestInfo = {
        userId: req.user?.id || null, // Se tiver usuário autenticado
        requestIp: req.ip,
        userAgent: req.get('User-Agent')
      };

      // Processar reset de senha com auditoria
      const result = await moodleResetPassword.requestPasswordReset(
        moodleUrl,
        searchData,
        requestInfo
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      // CORREÇÃO: Verificar se existe user antes de acessar fullname
      if (result.user && result.user.fullname) {
        logger.success(`Reset de senha processado para: ${result.user.fullname}`);
      } else {
        logger.success(`Reset de senha processado (usuário não encontrado, mas retornando sucesso por segurança)`);
      }

      // Resposta de sucesso sem expor dados sensíveis
      res.json({
        success: true,
        message: 'Se o usuário existir, um email de reset de senha será enviado',
        timestamp: new Date().toISOString()
        // Removido auditingId para não expor informações internas
      });

    } catch (error) {
      logger.error(`Erro no reset de senha: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
 * Valida token de reset de senha
 * POST /api/moodle/validate-reset-token
 */
  async validateResetToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        logger.error('Token não fornecido para validação');
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        });
      }

      logger.debug(`Validação de token de reset solicitada`);

      // Adicionar await pois agora é função async
      const result = await moodleResetPassword.validateResetToken(token);

      if (!result.success) {
        logger.warning(`Token inválido na validação: ${result.message}`);
        return res.status(400).json(result);
      }

      logger.success(`Token de reset validado para usuário: ${result.data.username}`);

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          username: result.data.username,
          email: result.data.email,
          moodleUrl: result.data.moodleUrl,
          tokenValid: true
        }
      });

    } catch (error) {
      logger.error(`Erro na validação de token: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Redefine senha com token (ROTA PÚBLICA)
   * POST /api/moodle/change-password
   */
  async changePassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Validações básicas
      if (!token) {
        logger.error('Token não fornecido na requisição');
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        });
      }

      if (!newPassword) {
        logger.error('Nova senha não fornecida na requisição');
        return res.status(400).json({
          success: false,
          message: 'Nova senha é obrigatória'
        });
      }

      // Validar senha
      const passwordValidation = moodleUpdateUser.validatePassword(newPassword);
      if (!passwordValidation.success) {
        logger.error(`Senha inválida: ${passwordValidation.message}`);
        return res.status(400).json(passwordValidation);
      }

      logger.info(`Redefinição de senha solicitada via token`);

      // Validar token (agora com await)
      const tokenValidation = await moodleResetPassword.validateResetToken(token);
      if (!tokenValidation.success) {
        logger.error(`Token inválido: ${tokenValidation.message}`);
        return res.status(400).json(tokenValidation);
      }

      const { userId, email, username, moodleUrl } = tokenValidation.data;

      // Atualizar senha usando o service de update
      const result = await moodleUpdateUser.updateUser(moodleUrl, userId, {
        password: newPassword
      });

      if (!result.success) {
        logger.error(`Erro ao alterar senha: ${result.message}`);
        return res.status(400).json(result);
      }

      // Marcar token como usado na auditoria
      const markResult = await moodleResetPassword.markTokenAsUsed(token);
      if (!markResult) {
        logger.warning('Falha ao marcar token como usado, mas senha foi alterada');
      }

      logger.success(`Senha redefinida com sucesso para usuário: ${username || email}`);

      // Resposta de sucesso
      res.json({
        success: true,
        message: 'Senha redefinida com sucesso',
        user: {
          email,
          url: moodleUrl, // url de redirecionamento
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Erro na redefinição de senha: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new MoodleController();