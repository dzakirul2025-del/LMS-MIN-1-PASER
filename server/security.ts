import crypto from 'crypto';

const STUDENT_CODE_PEPPER = process.env.STUDENT_CODE_PEPPER || 'pepper-min1paser-student-access-code-v1';
const SESSION_SECRET = process.env.SESSION_SECRET || 'session-secret-min1paser-fase-c-kelas-6-v1';

/**
 * Hash kode akses siswa dengan HMAC-SHA-256 + Server Pepper
 * Plaintext tidak pernah disimpan di database!
 */
export function hashStudentAccessCode(plainCode: string): string {
  const normalized = plainCode.trim().toUpperCase();
  return crypto
    .createHmac('sha256', STUDENT_CODE_PEPPER)
    .update(normalized)
    .digest('hex');
}

/**
 * Verifikasi kode akses siswa
 */
export function verifyStudentAccessCode(plainCode: string, expectedHash: string): boolean {
  const computedHash = hashStudentAccessCode(plainCode);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
}

/**
 * Hasilkan kode akses acak berentropi tinggi dan ramah anak (hindari karakter ambigu 0/O, 1/I/L)
 * Contoh output: PAS-6A-7842
 */
export function generateStudentAccessCode(className: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const cleanClass = className.replace(/[^A-E]/g, '') || 'X';
  let randomPart = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }
  return `PAS-6${cleanClass}-${randomPart}`;
}

/**
 * Buat signed session token
 */
export function createSessionToken(payload: object): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const b64Data = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(b64Data)
    .digest('base64url');
  return `${b64Data}.${signature}`;
}

/**
 * Verifikasi signed session token
 */
export function verifySessionToken(token: string): any | null {
  try {
    const [b64Data, signature] = token.split('.');
    if (!b64Data || !signature) return null;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(b64Data)
      .digest('base64url');
    if (signature !== expectedSignature) return null;
    const jsonStr = Buffer.from(b64Data, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    if (parsed.exp && parsed.exp < Date.now()) {
      return null; // Expired
    }
    return parsed;
  } catch (e) {
    return null;
  }
}
