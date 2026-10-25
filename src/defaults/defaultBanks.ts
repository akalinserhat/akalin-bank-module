/**
 * @akalin/bank_module - Varsayılan Banka Verileri (defaultBanks.ts)
 */

import { BankaDTO, BankaSubeDTO } from '../types';

export const DEFAULT_SAMPLE_BANKS: BankaDTO[] = [
  { id: 1, kod: '0010', ad: 'T.C. Ziraat Bankası A.Ş.', aktifMi: true, subeSayisi: 1750 },
  { id: 2, kod: '0012', ad: 'Türkiye Halk Bankası A.Ş.', aktifMi: true, subeSayisi: 1000 },
  { id: 3, kod: '0015', ad: 'Türkiye Vakıflar Bankası T.A.O.', aktifMi: true, subeSayisi: 950 },
  { id: 4, kod: '0064', ad: 'Türkiye İş Bankası A.Ş.', aktifMi: true, subeSayisi: 1200 },
  { id: 5, kod: '0062', ad: 'Türkiye Garanti Bankası A.Ş.', aktifMi: true, subeSayisi: 850 },
  { id: 6, kod: '0046', ad: 'Akbank T.A.Ş.', aktifMi: true, subeSayisi: 700 },
  { id: 7, kod: '0067', ad: 'Yapı ve Kredi Bankası A.Ş.', aktifMi: true, subeSayisi: 780 },
  { id: 8, kod: '0111', ad: 'QNB Finansbank A.Ş.', aktifMi: true, subeSayisi: 450 },
  { id: 9, kod: '0134', ad: 'Denizbank A.Ş.', aktifMi: true, subeSayisi: 650 },
  { id: 10, kod: '0032', ad: 'Türk Ekonomi Bankası A.Ş.', aktifMi: true, subeSayisi: 450 },
];

export const DEFAULT_SAMPLE_BRANCHES: BankaSubeDTO[] = [
  { id: 101, bankaId: 1, subeKodu: '0001', subeAdi: 'Ankara Merkez Şubesi', aktifMi: true, ilKodu: '06', ilce: 'Altındağ' },
  { id: 102, bankaId: 1, subeKodu: '0002', subeAdi: 'Kızılay Şubesi', aktifMi: true, ilKodu: '06', ilce: 'Çankaya' },
  { id: 103, bankaId: 1, subeKodu: '0003', subeAdi: 'Kadıköy Şubesi', aktifMi: true, ilKodu: '34', ilce: 'Kadıköy' },
  { id: 201, bankaId: 4, subeKodu: '1001', subeAdi: 'İstanbul Ana Şube', aktifMi: true, ilKodu: '34', ilce: 'Beyoğlu' },
  { id: 202, bankaId: 4, subeKodu: '1002', subeAdi: 'Bakırköy Şubesi', aktifMi: true, ilKodu: '34', ilce: 'Bakırköy' },
];
