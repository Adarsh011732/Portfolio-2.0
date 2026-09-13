import { handleCors, readBody, json } from '../_lib/cors.js';
import { getActiveOtp, deleteActiveOtp, getStoredPasskey } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 64 * 1024);
    const payload = JSON.parse(body || '{}');
    const submittedCode = (payload.code || payload.otp || '').trim();
    const masterPin = (payload.pin || '').trim();

    const validOtp = await getActiveOtp();
    const dbPasskey = await getStoredPasskey();
    const currentPasskey = dbPasskey || process.env.OWNER_PASSKEY || '9369';

    // Validate against active OTP or configured passkey
    if ((validOtp && submittedCode === validOtp) || submittedCode === currentPasskey || masterPin === currentPasskey) {
      if (validOtp && submittedCode === validOtp) {
        await deleteActiveOtp();
      }

      json(res, 200, {
        success: true,
        authenticated: true,
        token: `owner_token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        message: 'Authentication successful. Welcome back!'
      });
      return;
    }

    json(res, 401, {
      success: false,
      error: 'Invalid or expired verification code / passkey. Please try again.'
    });
  } catch (e) {
    json(res, 400, { error: 'Invalid verification payload: ' + e.message });
  }
}
