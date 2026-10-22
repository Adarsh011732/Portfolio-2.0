import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { handleCors, readBody, json } from '../_lib/cors.js';
import {
  getActiveOtp, setActiveOtp, deleteActiveOtp, setStoredPasskey,
  getRateLimit, setRateLimit, clearRateLimit
} from '../_lib/db.js';
import {
  isValidOtp, safeCompareOtp, evaluateRateLimit,
  issueSessionCookies, requireOwnerSession, isValidEmail
} from '../_lib/security.js';

const OTP_SEND_LIMITS = { max: 3, windowMs: 15 * 60 * 1000 };
const OTP_FAIL_LIMITS = { max: 5, windowMs: 15 * 60 * 1000 };
const SESSION_TTL_SECONDS = 8 * 3600;

async function applyRateLimit(key, limits) {
  const state = await getRateLimit(key);
  const result = evaluateRateLimit(state, limits);
  await setRateLimit(key, result.state);
  return result;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const action = req.query?.action || req.url.split('/').pop().split('?')[0];

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  // ------------------------------------------------------------------ send-otp
  if (action === 'send-otp') {
    try {
      const limit = await applyRateLimit('otp_send', OTP_SEND_LIMITS);
      if (!limit.allowed) {
        json(res, 429, { success: false, error: 'Too many OTP requests. Please wait a few minutes before requesting another code.' });
        return;
      }

      const destination = process.env.OWNER_EMAIL;
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!destination || !isValidEmail(destination)) {
        json(res, 500, { success: false, error: 'Owner email is not configured on the server.' });
        return;
      }

      if (!emailUser || !emailPass) {
        // NEVER return the OTP to the client: without SMTP the owner login is
        // unavailable, full stop. (The old build leaked the OTP right here.)
        json(res, 503, { success: false, error: 'Email delivery is not configured on the server. Owner login is unavailable until EMAIL_USER and EMAIL_PASS are set.' });
        return;
      }

      const otp = crypto.randomInt(100000, 1000000).toString();
      await deleteActiveOtp(); // invalidate any previous code first
      await setActiveOtp(otp);

      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: { user: emailUser, pass: emailPass }
        });

        await transporter.sendMail({
          from: `"Adarsh Portfolio Security" <${emailUser}>`,
          to: destination,
          subject: `🔐 Your Owner Login Verification OTP: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #4338ca; margin-top: 0;">Portfolio Owner Verification</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                A request was received to access Owner Mode for your portfolio. Use the single-use 6-digit OTP below to authenticate.
              </p>
              <div style="background-color: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b;">${otp}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                This OTP is valid for 5 minutes. If you did not initiate this request, no action is needed.
              </p>
            </div>
          `
        });

        // A freshly delivered code gives the owner a clean attempt slate
        await clearRateLimit('otp_fail');

        json(res, 200, {
          success: true,
          message: `A 6-digit verification code has been dispatched to ${destination}.`,
          expiresInSeconds: 300
        });
      } catch (err) {
        console.error('[Nodemailer] OTP delivery failed:', err.message);
        json(res, 503, { success: false, error: 'Could not deliver the verification email right now. Please try again shortly.' });
      }
    } catch (e) {
      console.error('[auth send-otp]:', e.message);
      json(res, 500, { success: false, error: 'Failed to generate OTP.' });
    }
    return;
  }

  // ---------------------------------------------------------------- verify-otp
  if (action === 'verify-otp') {
    let payload = {};
    try {
      const body = await readBody(req, 16 * 1024);
      payload = JSON.parse(body || '{}');
    } catch {
      json(res, 400, { success: false, error: 'Invalid request payload.' });
      return;
    }

    // SECURITY CHANGE: the legacy master-PIN login path has been REMOVED.
    // The 6-digit email OTP is the only way to authenticate as the owner.
    // Any 'pin'/'masterPin' fields in the payload are ignored.
    const submittedCode = String(payload.code ?? '').trim();

    if (!isValidOtp(submittedCode)) {
      json(res, 400, { success: false, error: 'Enter the 6-digit code from your email.' });
      return;
    }

    try {
      const failLimit = await applyRateLimit('otp_fail', OTP_FAIL_LIMITS);
      if (!failLimit.allowed) {
        json(res, 429, { success: false, error: 'Too many failed attempts. Please request a new code and try again.' });
        return;
      }

      const validOtp = await getActiveOtp();
      if (!validOtp || !safeCompareOtp(submittedCode, validOtp)) {
        json(res, 401, { success: false, error: 'Invalid or expired verification code. Please try again.' });
        return;
      }

      await deleteActiveOtp();
      await clearRateLimit('otp_fail');

      // Mint a real server-side session: HttpOnly HMAC cookie + CSRF pair
      const { token, csrf } = issueSessionCookies(res, { secure: true }); // serverless is always HTTPS

      json(res, 200, {
        success: true,
        authenticated: true,
        token,
        csrfToken: csrf,
        expiresIn: SESSION_TTL_SECONDS,
        message: 'Authentication successful. Welcome back!'
      });
    } catch (e) {
      console.error('[auth verify-otp]:', e.message);
      json(res, 500, { success: false, error: 'Verification failed. Please try again.' });
    }
    return;
  }

  // ------------------------------------------------------------- reset-passkey
  // Session-gated (owner must already be OTP-verified). The passkey is stored
  // as a scrypt hash — never plaintext — and is no longer a login method.
  if (action === 'reset-passkey') {
    if (!requireOwnerSession(req, res)) return;

    let payload = {};
    try {
      const body = await readBody(req, 16 * 1024);
      payload = JSON.parse(body || '{}');
    } catch {
      json(res, 400, { success: false, error: 'Invalid request payload.' });
      return;
    }

    const newPasskey = String(payload.newPasskey ?? '').trim();
    if (newPasskey.length < 8) {
      json(res, 400, { success: false, error: 'New passkey must be at least 8 characters.' });
      return;
    }

    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(newPasskey, salt, 32).toString('hex');
      await setStoredPasskey(`${salt}:${hash}`);
      json(res, 200, { success: true, message: 'Master passkey updated successfully!' });
    } catch (e) {
      console.error('[auth reset-passkey]:', e.message);
      json(res, 500, { success: false, error: 'Failed to reset passkey.' });
    }
    return;
  }

  json(res, 404, { error: 'Unknown auth action.' });
}
