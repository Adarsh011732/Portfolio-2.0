import { handleCors, readBody, json } from '../_lib/cors.js';
import { getActiveOtp, deleteActiveOtp, setStoredPasskey } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 64 * 1024);
    const payload = JSON.parse(body || '{}');
    const otp = (payload.otp || '').trim();
    const newPasskey = (payload.newPasskey || '').trim();

    const validOtp = await getActiveOtp();

    if (!newPasskey || newPasskey.length < 4) {
      json(res, 400, { error: 'New passkey must be at least 4 characters.' });
      return;
    }

    if (!validOtp || otp !== validOtp) {
      json(res, 401, { error: 'Invalid or expired OTP. Please request a new OTP to reset your passkey.' });
      return;
    }

    // Invalidate OTP
    await deleteActiveOtp();

    // Persist new passkey to MongoDB
    await setStoredPasskey(newPasskey);

    json(res, 200, {
      success: true,
      message: 'Master passkey updated successfully!'
    });
  } catch (e) {
    json(res, 500, { error: 'Failed to reset passkey: ' + e.message });
  }
}
