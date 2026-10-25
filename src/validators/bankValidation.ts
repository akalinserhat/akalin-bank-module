/**
 * @akalin/bank_module - Doğrulama Kuralları (bankValidation.ts)
 */

export interface BankValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateBankCode(kod: string | number): BankValidationResult {
  if (!kod || !String(kod).trim()) {
    return { isValid: false, message: 'Banka / EFT kodu boş olamaz.' };
  }
  const clean = String(kod).trim();
  if (clean.length > 10) {
    return { isValid: false, message: 'Banka kodu en fazla 10 karakter olabilir.' };
  }
  return { isValid: true };
}

export function validateBranchCode(kod: string | number): BankValidationResult {
  if (!kod || !String(kod).trim()) {
    return { isValid: false, message: 'Şube kodu boş olamaz.' };
  }
  const clean = String(kod).trim();
  if (clean.length > 10) {
    return { isValid: false, message: 'Şube kodu en fazla 10 karakter olabilir.' };
  }
  return { isValid: true };
}

export function validateBankName(ad: string): BankValidationResult {
  if (!ad || !ad.trim()) {
    return { isValid: false, message: 'Banka adı boş olamaz.' };
  }
  if (ad.trim().length > 150) {
    return { isValid: false, message: 'Banka adı en fazla 150 karakter olabilir.' };
  }
  return { isValid: true };
}

export function validateBranchName(ad: string): BankValidationResult {
  if (!ad || !ad.trim()) {
    return { isValid: false, message: 'Şube adı boş olamaz.' };
  }
  if (ad.trim().length > 150) {
    return { isValid: false, message: 'Şube adı en fazla 150 karakter olabilir.' };
  }
  return { isValid: true };
}
