import nodemailer from 'nodemailer';
import { handleCors, readBody, json } from './_lib/cors.js';
import { getRateLimit, setRateLimit } from './_lib/db.js';
import { escapeHtml, isValidEmail, evaluateRateLimit, getClientIp } from './_lib/security.js';

const CONTACT_LIMITS = { max: 5, windowMs: 60 * 60 * 1000 }; // 5 per hour per IP

const FIELD_LIMITS = { name: 100, email: 254, subject: 200, message: 5000 };

function cleanField(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maxLen);
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 64 * 1024);
    const { name, email, subject, message } = JSON.parse(body || '{}');

    const cleanName = cleanField(name, FIELD_LIMITS.name);
    const cleanEmail = cleanField(email, FIELD_LIMITS.email);
    const cleanSubject = cleanField(subject, FIELD_LIMITS.subject);
    const cleanMessage = cleanField(message, FIELD_LIMITS.message);

    if (!cleanName || !cleanEmail || !cleanMessage) {
      json(res, 400, { error: 'Name, email, and message are required.' });
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      json(res, 400, { error: 'Please provide a valid email address.' });
      return;
    }

    // Per-IP rate limit (stored in MongoDB so it survives across instances)
    const ip = getClientIp(req);
    const rateKey = `contact:${ip}`;
    const state = await getRateLimit(rateKey);
    const limit = evaluateRateLimit(state, CONTACT_LIMITS);
    await setRateLimit(rateKey, limit.state);
    if (!limit.allowed) {
      json(res, 429, { success: false, error: 'Too many messages sent from this address. Please try again later.' });
      return;
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const destination = process.env.OWNER_EMAIL;

    if (!emailUser || !emailPass || !destination) {
      console.warn('[Contact] Email credentials not configured on server.');
      json(res, 200, { success: true, message: 'Message received (SMTP credentials not configured).' });
      return;
    }

    // Escape EVERYTHING rendered into the email HTML (anti HTML-injection)
    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage);

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    await transporter.sendMail({
      from: `"${safeName} (Portfolio Inquiry)" <${emailUser}>`,
      to: destination,
      replyTo: cleanEmail,
      subject: `📬 Portfolio Inquiry: ${safeSubject || `New message from ${safeName}`}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #4338ca; margin: 0; font-size: 22px;">New Contact Message</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Sent from your portfolio website</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;"><strong>Sender:</strong></td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #4338ca; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #4338ca; text-decoration: none;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Topic:</strong></td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${safeSubject || 'General Inquiry'}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Message:</p>
            <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
            <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(cleanSubject || 'Portfolio Inquiry')}"
               style="display: inline-block; background-color: #4338ca; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Reply directly to ${safeName}
            </a>
          </div>
        </div>
      `
    });

    json(res, 200, { success: true, message: 'Message delivered to email inbox successfully!' });
  } catch (err) {
    console.error('[Contact Error]:', err.message);
    json(res, 500, { success: false, error: 'Failed to send message. Please try again later.' });
  }
}
