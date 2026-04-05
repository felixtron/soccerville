import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail({
  to,
  teamName,
  captainName,
  email,
  password,
}: {
  to: string;
  teamName: string;
  captainName: string;
  email: string;
  password: string;
}) {
  const loginUrl = process.env.AUTH_URL
    ? `${process.env.AUTH_URL}/login`
    : "https://soccerville.prosuite.pro/login";

  const safeName = escapeHtml(captainName);
  const safeTeam = escapeHtml(teamName);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:500px;margin:0 auto;padding:32px 16px">
    <!-- Header -->
    <div style="background:#0a0a0a;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center">
      <img src="https://soccerville.prosuite.pro/images/soccerville-w.svg" alt="Soccerville" width="60" height="60" style="margin-bottom:16px">
      <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:2px;text-transform:uppercase">Soccerville</h1>
      <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:8px 0 0">Futbol 7 Competitivo</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px 24px;border-radius:0 0 16px 16px">
      <h2 style="font-size:20px;margin:0 0 8px;color:#0a0a0a">Bienvenido, ${safeName}!</h2>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px">
        Tu equipo <strong style="color:#0a0a0a">${safeTeam}</strong> ha sido registrado en Soccerville.
        Ahora puedes acceder al portal de capitan para ver tu calendario, posiciones y gestionar tu plantilla.
      </p>

      <!-- Credentials box -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin:0 0 12px">Datos de acceso</p>
        <table style="width:100%;font-size:14px">
          <tr>
            <td style="padding:4px 0;color:#6b7280;width:80px">Email:</td>
            <td style="padding:4px 0;font-weight:600;color:#0a0a0a">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280">Contrasena:</td>
            <td style="padding:4px 0;font-weight:600;color:#0a0a0a">${safePassword}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <a href="${loginUrl}" style="display:block;background:#059669;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px">
        Entrar a Mi Equipo
      </a>

      <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center">
        Te recomendamos cambiar tu contrasena despues del primer acceso.
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin:16px 0 0">
      Soccerville — Metepec & Calimaya
    </p>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `${teamName} — Bienvenido a Soccerville`,
      html,
    });
    return true;
  } catch (e) {
    console.error("Email send error:", e);
    return false;
  }
}
