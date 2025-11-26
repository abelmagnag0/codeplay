const userRepository = require('../repositories/userRepository');
const tokenService = require('./tokenService');

const register = async (data) => {
  // TODO: implement user registration
  return { message: 'register service not implemented', data };
};

const login = async (credentials) => {
  // TODO: implement user login
  return { message: 'login service not implemented', credentials };
};

const refreshToken = async (token) => {
  // TODO: implement token refresh
  return tokenService.refresh(token);
};

module.exports = {
  register,
  login,
  refreshToken,
};
