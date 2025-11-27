const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transport;
let transportChecked = false;

const resolveTransport = () => {
  if (transport || transportChecked) {
    return transport;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

  if (!host || !port || !user || !pass) {
    transportChecked = true;
    logger.warn('Email transport not configured', {
      hostConfigured: Boolean(host),
      portConfigured: Boolean(port),
      userConfigured: Boolean(user),
    });
    return null;
  }

  transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  transportChecked = true;
  return transport;
};

const buildUrl = (path = '') => {
  const base = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
  const normalizedPath = String(path || '').replace(/^\//, '');
  return `${base}/${normalizedPath}`;
};

const sendMail = async (message) => {
  const currentTransport = resolveTransport();
  if (!currentTransport) {
    logger.warn('Skipping email dispatch because transport is not configured', {
      subject: message.subject,
      to: message.to,
    });
    return;
  }

  const mailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const finalMessage = {
    from: mailFrom,
    ...message,
  };

  try {
    await currentTransport.sendMail(finalMessage);
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      subject: finalMessage.subject,
      to: finalMessage.to,
    });
    throw error;
  }
};

const sendEmailVerification = async ({ to, name, token, expiresAt }) => {
  const verificationUrl = buildUrl(`/verify-email?token=${token}`);
  const subject = 'Confirme seu e-mail no Codeplay';
  const text = `Olá ${name},\n\nPara ativar sua conta, confirme o e-mail acessando: ${verificationUrl}\n\nEste link expira em ${expiresAt.toISOString()}.`;
  const html = `<p>Olá ${name},</p><p>Para ativar sua conta, <a href="${verificationUrl}">clique aqui</a>.</p><p>Este link expira em ${expiresAt.toISOString()}.</p>`;

  await sendMail({ to, subject, text, html });
};

const sendPasswordReset = async ({ to, name, token, expiresAt }) => {
  const resetUrl = buildUrl(`/reset-password?token=${token}`);
  const subject = 'Recupere sua senha no Codeplay';
  const text = `Olá ${name},\n\nRecebemos um pedido para redefinir sua senha. Acesse: ${resetUrl}\n\nEste link expira em ${expiresAt.toISOString()}. Se não foi você, ignore.`;
  const html = `<p>Olá ${name},</p><p>Recebemos um pedido para redefinir sua senha. <a href="${resetUrl}">Clique aqui</a> para continuar.</p><p>Este link expira em ${expiresAt.toISOString()}. Se não foi você, ignore este e-mail.</p>`;

  await sendMail({ to, subject, text, html });
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
};
