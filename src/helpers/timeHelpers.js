/**
 * Utilitários para manipulação de tempo
 */

/**
 * Converte tempo de expiração para milissegundos
 * @param {string} expiration - Tempo no formato "5m", "1h", etc.
 * @returns {number} Tempo em milissegundos
 */
function parseExpirationToMs(expiration) {
  const timeMap = {
    's': 1000,           // segundos
    'm': 60 * 1000,      // minutos  
    'h': 60 * 60 * 1000, // horas
    'd': 24 * 60 * 60 * 1000 // dias
  };

  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 5 * 60 * 1000; // fallback 5 minutos
  }

  const [, amount, unit] = match;
  return parseInt(amount) * timeMap[unit];
}

/**
 * Converte tempo de expiração para formato humano
 * @param {string} expiration - Tempo no formato "5m", "1h", etc.
 * @returns {string} Tempo em formato legível
 */
function getHumanTime(expiration) {
  const timeMap = {
    's': 'segundos',
    'm': 'minutos',
    'h': 'horas',
    'd': 'dias'
  };

  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return "5 minutos"; // fallback
  }

  const [, amount, unit] = match;
  return `${amount} ${timeMap[unit]}`;
}

module.exports = {
  parseExpirationToMs,
  getHumanTime
};