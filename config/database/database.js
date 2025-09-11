const { Sequelize } = require('sequelize');
const dbConfig = require('../config.js');
const logger = require('../utils/logger');

// Importar modelos
const User = require('../model/User');
const WebService = require('../model/WebService');
const Auditing = require('../model/Auditing.js');
const TemplatesEmail = require('../model/TemplatesEmail.js');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Inicializar o modelo User (classe ES6)
User.init(sequelize);
WebService.init(sequelize);
Auditing.init(sequelize);
TemplatesEmail.init(sequelize);
// Se houver associações, inicializá-las

// User.associate && User.associate({ WebServiceModel });
// WebServiceModel.associate && WebServiceModel.associate({ User });
// Auditing.associate && Auditing.associate({ User, WebServiceModel });
// TemplatesEmail.associate && TemplatesEmail.associate({ User, WebServiceModel });

const models = {
  User,
  WebService,
  Auditing,
  TemplatesEmail
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    // logger.success('Conexão com PostgreSQL estabelecida');
    return true;
  } catch (error) {
    logger.error(`Erro ao conectar: ${error.message}`);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.success(`Banco sincronizado ${force ? '(força)' : ''}`);
  } catch (error) {
    logger.error(`Erro ao sincronizar: ${error.message}`);
  }
};

const closeDatabase = async () => {
  try {
    await sequelize.close();
    // logger.info('Conexão fechada');
  } catch (error) {
    logger.error(`Erro ao fechar: ${error.message}`);
  }
};

module.exports = {
  sequelize,
  models,

  // Modelos exportados
  User,
  WebService,
  Auditing,
  TemplatesEmail,


  connectDatabase,
  syncDatabase,
  closeDatabase,
  Sequelize
};