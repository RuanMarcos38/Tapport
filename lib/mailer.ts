import "server-only";

import nodemailer from "nodemailer";

type PasswordResetEmail = {
  to: string;
  name: string;
  companyName: string;
  resetUrl: string;
};

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !from) return null;

  return {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    from
  };
}

export function isMailConfigured() {
  return Boolean(smtpConfig());
}

export async function sendPasswordResetEmail(input: PasswordResetEmail) {
  const config = smtpConfig();
  if (!config) return { sent: false, reason: "missing_smtp_config" as const };

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: "Redefinição de senha - Tapport",
    text: [
      `Olá, ${input.name}.`,
      "",
      `Recebemos uma solicitação para redefinir sua senha no Tapport (${input.companyName}).`,
      `Use este link nos próximos 30 minutos: ${input.resetUrl}`,
      "",
      "Se você não solicitou essa alteração, ignore este e-mail."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h1 style="font-size:20px">Redefinição de senha</h1>
        <p>Olá, ${input.name}.</p>
        <p>Recebemos uma solicitação para redefinir sua senha no Tapport (${input.companyName}).</p>
        <p>
          <a href="${input.resetUrl}" style="display:inline-block;background:#020617;color:white;padding:10px 14px;border-radius:6px;text-decoration:none">
            Redefinir senha
          </a>
        </p>
        <p>Este link expira em 30 minutos. Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `
  });

  return { sent: true as const };
}
