export function normalizeChinaPhone(phone: unknown): string {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+86${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("86")) {
    return `+${digits}`;
  }

  return String(phone || "").trim();
}

export function normalizeChinaPhoneForAuth(phone: unknown): string {
  const normalized = normalizeChinaPhone(phone);

  return normalized.startsWith("+") ? normalized.slice(1) : normalized;
}
