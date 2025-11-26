const loadEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Environment variable ${key} is required`);
    }
  });
};

module.exports = {
  loadEnv,
};
