// Indian mobile numbers are stored as plain 10 digits (9876543210).
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  const ten = digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}
export const toE164 = (ten) => `+91${ten}`;
export const prettyPhone = (ten) => (ten ? `+91 ${ten.slice(0, 5)} ${ten.slice(5)}` : '');
export const waLink = (ten, text = '') => `https://wa.me/91${ten}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
