// Convert any common Kenyan phone format to the 254XXXXXXXXX format Daraja requires.
// Examples: 0712345678 → 254712345678, +254712345678 → 254712345678
export function normalizeMpesaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return digits; // return as-is and let the backend/Safaricom reject if invalid
}

export function validateKenyanPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return (
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.startsWith('254') && digits.length === 12) ||
    (digits.startsWith('7') && digits.length === 9)
  );
}
