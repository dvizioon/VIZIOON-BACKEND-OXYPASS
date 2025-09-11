/**
 * Configuração centralizada de variáveis para templates de email
 * Baseado nos dados retornados pela API core_user_search do Moodle
 */

const MOODLE_VARIABLES = {
  // Variáveis do usuário
  user: {
    id: {
      key: 'user.id',
      description: 'ID do usuário no Moodle',
      example: '11085'
    },
    username: {
      key: 'user.username',
      description: 'Nome de usuário (login)',
      example: 'joao123'
    },
    firstname: {
      key: 'user.firstname',
      description: 'Primeiro nome',
      example: 'João'
    },
    lastname: {
      key: 'user.lastname',
      description: 'Sobrenome',
      example: 'Silva'
    },
    fullname: {
      key: 'user.fullname',
      description: 'Nome completo',
      example: 'João Silva'
    },
    email: {
      key: 'user.email',
      description: 'Email do usuário',
      example: 'joao@exemplo.com'
    },
    idnumber: {
      key: 'user.idnumber',
      description: 'Número de identificação',
      example: '202100123'
    },
    address: {
      key: 'user.address',
      description: 'Endereço postal',
      example: 'Rua das Flores, 123'
    },
    phone1: {
      key: 'user.phone1',
      description: 'Telefone 1',
      example: '(11) 99999-9999'
    },
    phone2: {
      key: 'user.phone2',
      description: 'Telefone 2',
      example: '(11) 88888-8888'
    },
    department: {
      key: 'user.department',
      description: 'Departamento',
      example: 'Tecnologia da Informação'
    },
    institution: {
      key: 'user.institution',
      description: 'Instituição',
      example: 'Universidade Ceuma'
    },
    city: {
      key: 'user.city',
      description: 'Cidade',
      example: 'São Luís'
    },
    country: {
      key: 'user.country',
      description: 'País',
      example: 'BR'
    }
  },

  // Variáveis do sistema
  system: {
    currentDate: {
      key: 'system.currentDate',
      description: 'Data atual',
      example: '07/09/2025'
    },
    currentTime: {
      key: 'system.currentTime',
      description: 'Hora atual',
      example: '14:30'
    },
    systemName: {
      key: 'system.name',
      description: 'Nome do sistema',
      example: `${process.env.NAME_SERVICE || 'OxyPass'}`
    }
  },

  // Variáveis de reset de senha
  reset: {
    resetLink: {
      key: 'reset.link',
      description: 'Link para reset de senha',
      example: 'https://sistema.com/reset?token=abc123'
    },
    token: {
      key: 'reset.token',
      description: 'Token de reset de senha (completo)',
      example: 'abc123def456ghi789jkl012mno345pq'
    },
    expirationTime: {
      key: 'reset.expirationTime',
      description: 'Tempo de expiração do token',
      example: '5 minutos'
    }
  },

  // Variáveis do webservice
  webservice: {
    serviceName: {
      key: 'webservice.serviceName',
      description: 'Nome do serviço web',
      example: 'Oxy'
    },
    url: {
      key: 'webservice.url',
      description: 'URL do Moodle',
      example: 'ead.ceuma.br'
    }
  }
};

/**
 * Extrai variáveis de dados do usuário do Moodle
 * @param {Object} userData - Dados do usuário retornados do Moodle
 * @param {Object} webServiceData - Dados do webservice
 * @param {Object} additionalData - Dados adicionais (links, etc)
 * @returns {Object} Objeto com todas as variáveis
 */
function extractUserVariables(userData, webServiceData = {}, additionalData = {}) {
  const now = new Date();

  return {
    // Variáveis do usuário
    'user.id': userData.id || '',
    'user.username': userData.username || '',
    'user.firstname': userData.firstname || '',
    'user.lastname': userData.lastname || '',
    'user.fullname': userData.fullname || '',
    'user.email': userData.email || '',
    'user.idnumber': userData.idnumber || '',
    'user.address': userData.address || '',
    'user.phone1': userData.phone1 || '',
    'user.phone2': userData.phone2 || '',
    'user.department': userData.department || '',
    'user.institution': userData.institution || '',
    'user.city': userData.city || '',
    'user.country': userData.country || '',

    // Variáveis do sistema
    'system.currentDate': now.toLocaleDateString('pt-BR'),
    'system.currentTime': now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    'system.name': process.env.NAME_SERVICE || 'OxyPass',

    // Variáveis de reset
    'reset.link': additionalData.resetLink || '',
    'reset.token': additionalData.resetToken || '', // Token completo
    'reset.expirationTime': additionalData.expirationTime || '5 minutos',

    // Variáveis do webservice
    'webservice.serviceName': webServiceData.serviceName || '',
    'webservice.url': webServiceData.url || ''
  };
}

/**
 * Lista todas as variáveis disponíveis para documentação
 * @returns {Array} Array com todas as variáveis e suas descrições
 */
function getAllAvailableVariables() {
  const variables = [];

  Object.keys(MOODLE_VARIABLES).forEach(category => {
    Object.keys(MOODLE_VARIABLES[category]).forEach(variable => {
      const varData = MOODLE_VARIABLES[category][variable];
      variables.push({
        category,
        key: varData.key,
        description: varData.description,
        example: varData.example,
        usage: `{{${varData.key}}}`
      });
    });
  });

  return variables;
}

/**
 * Substitui variáveis em texto usando os dados fornecidos com suporte a modificadores
 * @param {string} text - Texto com variáveis no formato {{variavel}} ou {{variavel(modificador)}}
 * @param {Object} variables - Objeto com as variáveis
 * @returns {string} Texto com variáveis substituídas
 */
function replaceVariables(text, variables) {
  let result = text;
  
  // Regex para capturar variáveis com ou sem modificadores
  // Exemplo: {{reset.token}}, {{reset.token(20)}}, {{user.email(30)}}
  const variableRegex = /\{\{([^}]+?)(?:\((\d+)\))?\}\}/g;
  
  result = result.replace(variableRegex, (match, variableName, modifier) => {
    let value = variables[variableName] || '';
    
    // Se há um modificador numérico, truncar o valor
    if (modifier) {
      const length = parseInt(modifier);
      if (value.length > length) {
        value = value.substring(0, length) + '...';
      }
    }
    
    return value;
  });

  return result;
}

module.exports = {
  MOODLE_VARIABLES,
  extractUserVariables,
  getAllAvailableVariables,
  replaceVariables
};