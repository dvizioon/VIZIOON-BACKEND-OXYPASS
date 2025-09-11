const UserAuthService = require('./userAuth');
const UserShowService = require('./userShow');

const userAuth = new UserAuthService();
const userShow = new UserShowService();

module.exports = {
  userAuth,
  userShow
};