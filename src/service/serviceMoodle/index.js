const MoodleFindUserService = require('./moodleFindUser');
const MoodleResetPasswordService = require('./moodleResetPassword');
const MoodleUpdateUserService = require('./moodleUpdateUser');
const moodleVariables = require('./moodleVariables'); 

const moodleFindUser = new MoodleFindUserService();
const moodleResetPassword = new MoodleResetPasswordService();
const moodleUpdateUser = new MoodleUpdateUserService();

module.exports = {
  moodleFindUser,
  moodleResetPassword,
  moodleUpdateUser,
  moodleVariables
};