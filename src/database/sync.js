const { connectDatabase, closeDatabase, sequelize } = require('./database');
const logger = require('../utils/logger');

async function syncTables() {
  try {
    // Conectar ao banco
    const connected = await connectDatabase();
    if (!connected) {
      logger.error('Falha ao conectar com o banco de dados');
      process.exit(1);
    }

    // Sincronizar todas as tabelas baseado nos modelos
    await sequelize.sync({ alter: true });
    logger.success('Tabelas sincronizadas automaticamente baseado nos modelos');
    
  } catch (error) {
    logger.error(`Erro ao sincronizar tabelas: ${error.message}`);
  } finally {
    await closeDatabase();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncTables();
}

module.exports = { syncTables };