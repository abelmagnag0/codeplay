const info = (...args) => {
  /* eslint-disable no-console */
  console.log('[INFO]', ...args);
  /* eslint-enable no-console */
};

const error = (...args) => {
  /* eslint-disable no-console */
  console.error('[ERROR]', ...args);
  /* eslint-enable no-console */
};

module.exports = {
  info,
  error,
};
