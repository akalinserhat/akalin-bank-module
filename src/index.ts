/**
 * @akalin/bank_module - Ana Giriş Noktası (index.ts)
 * Bağımsız Banka ve Şube Yönetimi Modülü
 */

// Tipler
export * from './types';
export * from './definitions/entities';

// Varsayılan Veriler
export * from './defaults/defaultBanks';

// Doğrulayıcılar (Validators)
export * from './validators/bankValidation';

// Adaptörler & Context
export * from './adapters/BankServiceContext';

// Sayfalar ve Bileşenler
export { default as BankalarPage, BankalarPage as Bankalar, BankaCard } from './pages/BankalarPage';
export type { BankalarPageProps, BankaCardProps } from './pages/BankalarPage';
export { default as BankaSubeleriPage, BankaSubeleriPage as BankaSubeleri } from './pages/BankaSubeleriPage';
export type { BankaSubeleriPageProps } from './pages/BankaSubeleriPage';

// Modül Tanımı ve Fabrikası
export { createBankModule, BankalarVeSubelerModulu } from './createBankModule';
export { default } from './createBankModule';
