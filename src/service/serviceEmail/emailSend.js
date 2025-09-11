const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Serviço para envio de emails através da API OxyMail
 */
class EmailService {
  
  constructor() {
    this.url = 'https://gateway.ceuma.br/oxymail/email/send';
    this.timeout = 30000; // 30 segundos
  }


  /**
   * Envia email personalizado
   * @param {Object} emailData - Dados do email
   * @param {string} emailData.email - Email destinatário
   * @param {string} emailData.assunto - Assunto do email
   * @param {string} emailData.mensagem - Mensagem (pode conter HTML)
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendCustomEmail(emailData) {
    try {
      const { email, assunto, mensagem } = emailData;

      // Validações
      if (!email || !assunto || !mensagem) {
        return {
          success: false,
          message: 'Email, assunto e mensagem são obrigatórios'
        };
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Formato de email inválido'
        };
      }

      const body = {
        email,
        assunto,
        mensagem
      };

      logger.info(`Enviando email personalizado para: ${email}`);
      logger.debug(`Assunto: ${assunto}`);

      const response = await axios.post(this.url, body, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OxyPass-API/1.0'
        },
        responseType: 'text'
      });

      logger.success(`Email personalizado enviado com sucesso para: ${email}`);

      return {
        success: true,
        message: 'Email enviado com sucesso',
        data: {
          destinatario: email,
          assunto,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error(`Erro ao enviar email personalizado: ${error.message}`);

      if (error.response) {
        logger.error(`Status: ${error.response.status}`);
        logger.error(`Response: ${error.response.data}`);
      }

      return {
        success: false,
        message: 'Erro ao enviar email',
        error: error.response?.status || 'NETWORK_ERROR'
      };
    }
  }

 
}

module.exports = EmailService;