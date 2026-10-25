/**
 * @akalin/bank_module - Tip Tanımları (types.ts)
 * Bankalar ve Banka Şubeleri Modülü Veri Transfer Nesneleri (DTO) ve Servis Arayüzleri
 */

export interface BankaDTO {
  id: number;
  kod: string | number;
  ad: string;
  aktifMi?: boolean;
  subeSayisi?: number;
}

export interface BankaSubeDTO {
  id: number;
  bankaId: number;
  subeKodu: string | number;
  subeAdi: string;
  aktifMi: boolean;
  ilKodu?: string;
  ilce?: string;
}

export interface SyncTcmbResultDTO {
  basariliMi?: boolean;
  mesaj?: string;
  eklenenBankaSayisi?: number;
  guncellenenBankaSayisi?: number;
}

/**
 * Bağımsız Banka Servis Adaptörü Sözleşmesi (Adapter Interface)
 */
export interface IBankServiceAdapter {
  getBanks(): Promise<BankaDTO[]>;
  getBankById(id: number | string): Promise<BankaDTO>;
  getBranchesByBankId(bankId: number | string): Promise<BankaSubeDTO[]>;
  syncTcmbAll(): Promise<SyncTcmbResultDTO>;
  toggleBranchActive(branchId: number | string): Promise<{ aktifMi: boolean; mesaj: string }>;
}

export interface CreateBankModuleOptions {
  id?: string;
  appName?: string;
  baseRoute?: string;
  settingsModuleId?: string;
  order?: number;
  adapter?: IBankServiceAdapter;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}
