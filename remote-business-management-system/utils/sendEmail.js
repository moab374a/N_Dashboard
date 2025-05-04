const nodemailer = require("nodemailer");
const logger = require("./logger");

const sendEmail = async (options) => {
  // For development, use Ethereal (fake SMTP service)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || "ethereal_user",
      pass: process.env.SMTP_PASSWORD || "ethereal_password",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "Remote Business"} <${
      process.env.FROM_EMAIL || "noreply@remotebusiness.com"
    }>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(message);

  logger.info(`Email sent: ${info.messageId}`);
};

module.exports = sendEmail;
