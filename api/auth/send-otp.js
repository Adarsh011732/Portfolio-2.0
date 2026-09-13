import nodemailer from 'nodemailer';
import { handleCors, json } from '../_lib/cors.js';
import { setActiveOtp } from '../_lib/db.js';

let mailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

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
    let emailSent = false;

    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: `"Adarsh Portfolio Security" <${process.env.EMAIL_USER}>`,
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
        console.error('[Nodemailer] Could not send email:', err.message);
      }
    }

    json(res, 200, {
      success: true,
      message: emailSent
        ? 'A 6-digit verification code has been dispatched to your registered email.'
        : 'A 6-digit security OTP has been generated.',
      emailSent,
      expiresInSeconds: 300
    });
  } catch (e) {
    json(res, 500, { error: 'Failed to generate OTP: ' + e.message });
  }
}
