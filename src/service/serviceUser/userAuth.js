const jwt = require('jsonwebtoken');
const { User } = require('../../database/database');
const logger = require('../../utils/logger');
const authConfig = require('../../config/auth');

class UserAuthService {
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: authConfig.expiresIn || '1d'
    });
  }

  async authenticateUser(email, password) {
    try {

       logger.debug(`Tentando autenticar: ${email}`);
       
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      const isValidPassword = await user.checkPassword(password);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.success(`Login realizado: ${user.email}`);

      return {
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: user.toJSON()
      };
    } catch (error) {
      logger.error(`Erro na autenticação: ${error.message}`);
      return {
        success: false,
        message: 'Erro interno na autenticação'
      };
    }
  }

  

}

module.exports = UserAuthService;