const { inspect } = require('util');

const shouldPrettyPrint =
  process.env.LOG_PRETTY === 'true' || (process.env.NODE_ENV || 'development') !== 'production';

const buildEntry = (level, input, metadata = {}) => {
  const base = {
    level,
    timestamp: new Date().toISOString(),
  };

  if (input instanceof Error) {
    return {
      ...base,
      message: input.message,
      stack: input.stack,
      ...metadata,
    };
  }

  if (typeof input === 'string') {
    return {
      ...base,
      message: input,
      ...metadata,
    };
  }

  return {
    ...base,
    ...metadata,
    ...input,
  };
};

const toConsolePayload = (entry) => {
  if (!shouldPrettyPrint) {
    return JSON.stringify(entry);
  }

  const { level, timestamp, message, stack, requestId, ...rest } = entry;
  const parts = [`${timestamp} ${level.toUpperCase()}`];
  if (requestId) {
    parts[0] += ` [${requestId}]`;
  }
  if (message) {
    parts.push(message);
  }
  if (stack) {
    parts.push(stack);
  }
  const metadataKeys = Object.keys(rest);
  if (metadataKeys.length) {
    parts.push(inspect(rest, { depth: null, colors: false, compact: false }));
  }

  return parts.join('\n');
};

const info = (input, metadata) => {
  const entry = buildEntry('info', input, metadata);
  /* eslint-disable no-console */
  console.log(toConsolePayload(entry));
  /* eslint-enable no-console */
};

const warn = (input, metadata) => {
  const entry = buildEntry('warn', input, metadata);
  /* eslint-disable no-console */
  console.warn(toConsolePayload(entry));
  /* eslint-enable no-console */
};

const error = (input, metadata) => {
  const entry = buildEntry('error', input, metadata);
  /* eslint-disable no-console */
  console.error(toConsolePayload(entry));
  /* eslint-enable no-console */
};

module.exports = {
  info,
  warn,
  error,
};
