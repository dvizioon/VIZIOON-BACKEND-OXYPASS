// const apiClient = require('../../lib/api');
// const logger = require('../../utils/logger');
// const { webServiceShow } = require('../serviceWeb/index');

// /** 
//  * Serviço para buscar usuários usando API nativa do Moodle
//  * core_user_get_users_by_field
//  */
// class MoodleFindUserService {
  
//   /**
//    * Busca usuário por URL e email ou username
//    * @param {string} moodleUrl - URL do Moodle (ex: ead.ceuma.br)
//    * @param {Object} searchData - Objeto com email OU username
//    * @returns {Promise<Object>} Resultado da busca
//    */
//   async findUserByUrl(moodleUrl, searchData) {
//     try {
//       // Determinar campo e valor de busca
//       let searchType, identifier;
      
//       if (searchData.email && searchData.username) {
//         return {
//           success: false,
//           message: 'Informe apenas email OU username, não ambos'
//         };
//       }
      
//       if (searchData.email) {
//         searchType = 'email';
//         identifier = searchData.email;
//       } else if (searchData.username) {
//         searchType = 'username';
//         identifier = searchData.username;
//       } else {
//         return {
//           success: false,
//           message: 'Informe email ou username'
//         };
//       }

//       logger.info(`Buscando usuário: ${searchType}=${identifier} em ${moodleUrl}`);

//       // Buscar WebService pela URL
//       const webService = await webServiceShow.getWebServiceByUrl(moodleUrl);
//       if (!webService.success) {
//         return webService;
//       }

//       // Fazer busca no Moodle
//       const result = await this.searchInMoodle(webService.data, searchType, identifier);
      
//       return result;

//     } catch (error) {
//       logger.error(`Erro ao buscar usuário: ${error.message}`);
//       return {
//         success: false,
//         message: 'Erro interno na busca'
//       };
//     }
//   }

//   /**
//    * Faz a busca no Moodle
//    */
//   async searchInMoodle(webService, searchType, identifier) {
//     try {
//       const baseUrl = `${webService.protocol}://${webService.url}`;
      
//       logger.debug(`Fazendo busca: ${searchType}=${identifier} em ${baseUrl}`);
      
//       const params = {
//         wstoken: webService.token,
//         wsfunction: 'core_user_get_users_by_field',
//         field: searchType,
//         'values[0]': identifier
//       };

//       const result = await apiClient.get(baseUrl, webService.route, params);

//       if (!result.success) {
//         logger.error(`Falha na comunicação: ${result.message}`);
//         return {
//           success: false,
//           message: `Erro de comunicação: ${result.message}`
//         };
//       }

//       // Verificar se há erro do Moodle
//       if (result.data?.errorcode) {
//         logger.error(`Erro do Moodle: ${result.data.errorcode} - ${result.data.message}`);
//         return {
//           success: false,
//           message: `Erro Moodle: ${result.data.message}`,
//           errorCode: result.data.errorcode
//         };
//       }

//       // Processar resultado
//       if (!Array.isArray(result.data) || result.data.length === 0) {
//         logger.info(`Usuário não encontrado: ${searchType}=${identifier}`);
//         return {
//           success: false,
//           message: 'Usuário não encontrado',
//           searchType,
//           identifier
//         };
//       }

//       const user = result.data[0];
      
//       logger.success(`Usuário encontrado: ${user.fullname} (${user.email})`);
      
//       return {
//         success: true,
//         message: 'Usuário encontrado',
//         user: {
//           id: user.id,
//           username: user.username,
//           firstname: user.firstname,
//           lastname: user.lastname,
//           fullname: user.fullname,
//           email: user.email.toUpperCase(),
//           idnumber: user.idnumber,
//           suspended: user.suspended,
//           confirmed: user.confirmed
//         },
//         webService: {
//           serviceName: webService.serviceName,
//           url: webService.url
//         }
//       };

//     } catch (error) {
//       logger.error(`Erro na busca Moodle: ${error.message}`);
//       return {
//         success: false,
//         message: 'Erro interno na comunicação com Moodle'
//       };
//     }
//   }
// }

// module.exports = MoodleFindUserService;



const apiClient = require('../../lib/api');
const logger = require('../../utils/logger');
const { webServiceShow } = require('../serviceWeb/index');
const { extractUserVariables } = require('./moodleVariables');

/** 
 * Serviço para buscar usuários usando API nativa do Moodle
 * core_user_get_users_by_field
 */
class MoodleFindUserService {
  
  /**
   * Busca usuário por URL e email ou username
   * @param {string} moodleUrl - URL do Moodle (ex: ead.ceuma.br)
   * @param {Object} searchData - Objeto com email OU username
   * @param {boolean} includeVariables - Se deve incluir variáveis para templates (padrão: false)
   * @returns {Promise<Object>} Resultado da busca
   */
  async findUserByUrl(moodleUrl, searchData, includeVariables = false) {
    try {
      // Determinar campo e valor de busca
      let searchType, identifier;
      
      if (searchData.email && searchData.username) {
        return {
          success: false,
          message: 'Informe apenas email OU username, não ambos'
        };
      }
      
      if (searchData.email) {
        searchType = 'email';
        identifier = searchData.email;
      } else if (searchData.username) {
        searchType = 'username';
        identifier = searchData.username;
      } else {
        return {
          success: false,
          message: 'Informe email ou username'
        };
      }

      logger.info(`Buscando usuário: ${searchType}=${identifier} em ${moodleUrl}`);

      // Buscar WebService pela URL
      const webService = await webServiceShow.getWebServiceByUrl(moodleUrl);
      if (!webService.success) {
        return webService;
      }

      // Fazer busca no Moodle
      const result = await this.searchInMoodle(webService.data, searchType, identifier, includeVariables);
      
      return result;

    } catch (error) {
      logger.error(`Erro ao buscar usuário: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno na busca'
      };
    }
  }

  /**
   * Faz a busca no Moodle
   */
  async searchInMoodle(webService, searchType, identifier, includeVariables = false) {
    try {
      const baseUrl = `${webService.protocol}://${webService.url}`;
      
      logger.debug(`Fazendo busca: ${searchType}=${identifier} em ${baseUrl}`);
      
      const params = {
        wstoken: webService.token,
        wsfunction: 'core_user_get_users_by_field',
        field: searchType,
        'values[0]': identifier
      };

      const result = await apiClient.get(baseUrl, webService.route, params);

      if (!result.success) {
        logger.error(`Falha na comunicação: ${result.message}`);
        return {
          success: false,
          message: `Erro de comunicação: ${result.message}`
        };
      }

      // Verificar se há erro do Moodle
      if (result.data?.errorcode) {
        logger.error(`Erro do Moodle: ${result.data.errorcode} - ${result.data.message}`);
        return {
          success: false,
          message: `Erro Moodle: ${result.data.message}`,
          errorCode: result.data.errorcode
        };
      }

      // Processar resultado
      if (!Array.isArray(result.data) || result.data.length === 0) {
        logger.info(`Usuário não encontrado: ${searchType}=${identifier}`);
        return {
          success: false,
          message: 'Usuário não encontrado',
          searchType,
          identifier
        };
      }

      const user = result.data[0];
      
      logger.success(`Usuário encontrado: ${user.fullname} (${user.email})`);
      
      // Dados básicos de retorno
      const responseData = {
        success: true,
        message: 'Usuário encontrado',
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          fullname: user.fullname,
          email: user.email.toUpperCase(),
          idnumber: user.idnumber,
          suspended: user.suspended,
          confirmed: user.confirmed,
          // Campos adicionais da API core_user_search
          address: user.address,
          phone1: user.phone1,
          phone2: user.phone2,
          department: user.department,
          institution: user.institution,
          city: user.city,
          country: user.country
        },
        webService: {
          serviceName: webService.serviceName,
          url: webService.url
        }
      };

      // Incluir variáveis para templates se solicitado
      if (includeVariables) {
        responseData.templateVariables = extractUserVariables(
          user,
          { serviceName: webService.serviceName, url: webService.url }
        );
        
        logger.debug(`Variáveis de template extraídas para: ${user.fullname}`);
      }

      return responseData;

    } catch (error) {
      logger.error(`Erro na busca Moodle: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno na comunicação com Moodle'
      };
    }
  }
}

module.exports = MoodleFindUserService;