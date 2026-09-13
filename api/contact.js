import nodemailer from 'nodemailer';
import { handleCors, readBody, json } from './_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 64 * 1024);
    const { name, email, subject, message } = JSON.parse(body || '{}');

    if (!name || !email || !message) {
      json(res, 400, { error: 'Name, email, and message are required.' });
      return;
    }

    let emailUser = process.env.EMAIL_USER;
    let emailPass = process.env.EMAIL_PASS;
    let destination = process.env.OWNER_EMAIL || 'adarshsingh98635@gmail.com';

    if (!emailUser || !emailPass) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const candidates = [
          path.resolve(process.cwd(), '.env'),
          path.resolve(process.cwd(), 'backend', '.env')
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) {
            const lines = fs.readFileSync(p, 'utf8').split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [k, ...v] = trimmed.split('=');
                if (!process.env[k.trim()]) {
                  process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
                }
              }
            }
            break;
          }
        }
        emailUser = process.env.EMAIL_USER;
        emailPass = process.env.EMAIL_PASS;
        destination = process.env.OWNER_EMAIL || 'adarshsingh98635@gmail.com';
      } catch {}
    }

    if (!emailUser || !emailPass) {
      console.warn('[Contact] Email credentials not configured on server.');
      // Return success gracefully so user sees confirmation even if SMTP isn't set
      json(res, 200, { success: true, message: 'Message received (SMTP credentials not configured).' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: `"${name} (Portfolio Inquiry)" <${emailUser}>`,
      to: destination,
      replyTo: email,
      subject: `📬 Portfolio Inquiry: ${subject || `New message from ${name}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #4338ca; margin: 0; font-size: 22px;">New Contact Message</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Sent from your portfolio website</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;"><strong>Sender:</strong></td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #4338ca; font-size: 14px;"><a href="mailto:${email}" style="color: #4338ca; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Topic:</strong></td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${subject || 'General Inquiry'}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Message:</p>
            <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Portfolio Inquiry')}" 
               style="display: inline-block; background-color: #4338ca; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Reply directly to ${name}
            </a>
          </div>
        </div>
      `
    });

    json(res, 200, { success: true, message: 'Message delivered to email inbox successfully!' });
  } catch (err) {
    console.error('[Contact Error]:', err);
    json(res, 500, { error: 'Failed to send message: ' + err.message });
  }
}
