import nodemailer from 'nodemailer';
import { handleCors, json } from '../_lib/cors.js';
import { setActiveOtp } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await setActiveOtp(otp);

    const destination = process.env.OWNER_EMAIL || 'adarshsingh98635@gmail.com';
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    let emailSent = false;
    let mailError = null;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass
          }
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
        emailSent = true;
      } catch (err) {
        console.error('[Nodemailer] Could not send email:', err);
        mailError = err.message;
      }
    } else {
      mailError = 'EMAIL_USER or EMAIL_PASS not set on server';
    }

    json(res, 200, {
      success: true,
      message: emailSent
        ? `A 6-digit verification code has been dispatched to ${destination}.`
        : `OTP generated (${otp}), but email could not be delivered: ${mailError || 'Unknown error'}. You can use your Master Passkey to enter directly.`,
      emailSent,
      mailError: emailSent ? null : mailError,
      expiresInSeconds: 300
    });
  } catch (e) {
    json(res, 500, { error: 'Failed to generate OTP: ' + e.message });
  }
}
