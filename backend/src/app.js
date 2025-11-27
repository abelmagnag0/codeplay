const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const openApiPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
const openApiDocument = YAML.load(openApiPath);

// Core middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(
  morgan((tokens, req, res) => {
    const date = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : req.socket?.remoteAddress || req.ip;

    const usuario =
      req?.session?.usuario?.username ||
      req?.session?.usuario?.email ||
      req.user?.username ||
      req.user?.email ||
      'Desconhecido';

    return [
      `[${date}]`,
      `IP: ${clientIp}`,
      `USER: ${usuario} |`,
      `${tokens.method(req, res)}`,
      `URL: ${tokens.url(req, res)} |`,
      `Status: ${tokens.status(req, res)}`,
      `Tempo: ${tokens['response-time'](req, res)} ms`,
    ].join(' ');
  })
);

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
});
app.use(limiter);

// Serve interactive API documentation backed by the OpenAPI spec
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get('/docs/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

// Landing route for quick discovery of useful endpoints
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'CodePlay API',
    docs: '/docs',
    health: '/health',
  });
});

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
