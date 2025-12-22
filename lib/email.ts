import 'dotenv/config';
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const smtpUser = process.env.SMTP_USER || process.env.ELASTIC_EMAIL_USER;
const smtpPass = process.env.SMTP_PASSWORD || process.env.ELASTIC_EMAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST || 'smtp.elasticemail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn(
    'SMTP credentials are missing. Email delivery is disabled until SMTP_USER/ELASTIC_EMAIL_USER and SMTP_PASSWORD/ELASTIC_EMAIL_PASSWORD are provided.'
  );
}

export function isEmailConfigured() {
  return transporter !== null;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    throw new Error('Email service is not configured.');
  }

  const mailOptions = {
    from: process.env.MAIL_FROM || smtpUser,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}
