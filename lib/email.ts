import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.elasticemail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser =
  process.env.ELASTIC_EMAIL_USER ||
  process.env.SMTP_USERNAME ||
  process.env.SMTP_USER;
const smtpPass =
  process.env.ELASTIC_EMAIL_PASSWORD ||
  process.env.SMTP_PASSWORD ||
  process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  throw new Error(
    'SMTP credentials are missing. Ensure ELASTIC_EMAIL_USER and ELASTIC_EMAIL_PASSWORD (or SMTP_USERNAME/SMTP_PASSWORD) are set.',
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
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
