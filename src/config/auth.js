// config/auth.js
module.exports = {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "1d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "7d",
  
  reset: {
    secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || "mysecret",
    expiresIn: "5m",
    expiresInHuman: "5 minutos"
  },

  rateLimit: {
    resetPassword: {
      windowMs: 15 * 60 * 1000,
      max: 3,
      message: 'Muitas tentativas de reset. Tente novamente em 15 minutos.'
    }
  }
};