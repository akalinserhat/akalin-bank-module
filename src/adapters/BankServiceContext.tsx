/**
 * @akalin/bank_module - Servis Adaptörleri ve React Context (BankServiceContext.tsx)
 * REST ve LocalStorage adaptörleri ile monolitik bağımlılıkları tamamen soyutlar.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import {
  BankaDTO,
  BankaSubeDTO,
  IBankServiceAdapter,
  SyncTcmbResultDTO,
} from '../types';
import { DEFAULT_SAMPLE_BANKS, DEFAULT_SAMPLE_BRANCHES } from '../defaults/defaultBanks';

/**
 * 1) REST Tabanlı Standart Adaptör (Webakus API uyumlu)
 */
export function createRestBankAdapter(options?: {
  apiPrefix?: string;
  customHeaders?: Record<string, string> | (() => Record<string, string>);
  customFetch?: typeof fetch;
}): IBankServiceAdapter {
  const apiPrefix = (options?.apiPrefix || '/api/Bankalar').replace(/\/$/, '');
  const doFetch = options?.customFetch || fetch;

  const getHeaders = (extra?: Record<string, string>) => {
    let headers: Record<string, string> = {
      Accept: 'application/json',
      ...(extra || {}),
    };
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('admin_token') ||
        sessionStorage.getItem('token');
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    if (options?.customHeaders) {
      const custom = typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders;
      headers = { ...headers, ...custom };
    }
    return headers;
  };

  const handleJson = async (res: Response) => {
    if (!res.ok) {
      let errText = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errText = errJson.message || errJson.mesaj || JSON.stringify(errJson);
      } catch {
        try {
          errText = await res.text();
        } catch {}
      }
      throw new Error(errText);
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return null;
  };

  return {
    async getBanks(): Promise<BankaDTO[]> {
      const res = await doFetch(apiPrefix, { headers: getHeaders(), credentials: 'include' });
      return (await handleJson(res)) || [];
    },

    async getBankById(id: number | string): Promise<BankaDTO> {
      const res = await doFetch(`${apiPrefix}/${id}`, { headers: getHeaders(), credentials: 'include' });
      return await handleJson(res);
    },

    async getBranchesByBankId(bankId: number | string): Promise<BankaSubeDTO[]> {
      const res = await doFetch(`${apiPrefix}/${bankId}/subeler`, { headers: getHeaders(), credentials: 'include' });
      return (await handleJson(res)) || [];
    },

    async syncTcmbAll(): Promise<SyncTcmbResultDTO> {
      const res = await doFetch(`${apiPrefix}/sync-tcmb-all`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      });
      return await handleJson(res);
    },

    async toggleBranchActive(branchId: number | string): Promise<{ aktifMi: boolean; mesaj: string }> {
      const res = await doFetch(`${apiPrefix}/sube/${branchId}/toggle-aktif`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      });
      return await handleJson(res);
    },
  };
}

/**
 * 2) LocalStorage / Bellek Tabanlı Bağımsız Test Adaptörü
 */
export function createLocalStorageBankAdapter(options?: {
  defaultBanks?: BankaDTO[];
  defaultBranches?: BankaSubeDTO[];
}): IBankServiceAdapter {
  let banks: BankaDTO[] = options?.defaultBanks || [...DEFAULT_SAMPLE_BANKS];
  let branches: BankaSubeDTO[] = options?.defaultBranches || [...DEFAULT_SAMPLE_BRANCHES];

  return {
    async getBanks(): Promise<BankaDTO[]> {
      return JSON.parse(JSON.stringify(banks));
    },

    async getBankById(id: number | string): Promise<BankaDTO> {
      const found = banks.find((b) => String(b.id) === String(id));
      if (!found) throw new Error('Banka bulunamadı');
      return JSON.parse(JSON.stringify(found));
    },

    async getBranchesByBankId(bankId: number | string): Promise<BankaSubeDTO[]> {
      const list = branches.filter((s) => String(s.bankaId) === String(bankId));
      return JSON.parse(JSON.stringify(list));
    },

    async syncTcmbAll(): Promise<SyncTcmbResultDTO> {
      return {
        basariliMi: true,
        mesaj: 'TCMB Banka ve Şube listesi başarıyla eşitlendi (Simülasyon).',
        eklenenBankaSayisi: 0,
        guncellenenBankaSayisi: banks.length,
      };
    },

    async toggleBranchActive(branchId: number | string): Promise<{ aktifMi: boolean; mesaj: string }> {
      const sube = branches.find((s) => String(s.id) === String(branchId));
      if (!sube) throw new Error('Şube bulunamadı');
      sube.aktifMi = !sube.aktifMi;
      return {
        aktifMi: sube.aktifMi,
        mesaj: `Şube durumu ${sube.aktifMi ? 'Aktif' : 'Pasif'} olarak güncellendi.`,
      };
    },
  };
}

/**
 * 3) Bank Module Context & Provider
 */
export interface BankModuleContextValue {
  adapter: IBankServiceAdapter;
  appName: string;
  baseRoute: string;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const BankModuleContext = createContext<BankModuleContextValue | null>(null);

let globalBankModuleConfig: BankModuleContextValue | null = null;

export function setGlobalBankModuleConfig(config: BankModuleContextValue) {
  globalBankModuleConfig = config;
}

export function getGlobalBankModuleConfig(): BankModuleContextValue | null {
  return globalBankModuleConfig;
}

export interface BankModuleProviderProps {
  adapter?: IBankServiceAdapter;
  appName?: string;
  baseRoute?: string;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  children: ReactNode;
}

export const BankModuleProvider: React.FC<BankModuleProviderProps> = ({
  adapter,
  appName = 'Webakus ERP',
  baseRoute = '/bankalar',
  onNotify,
  children,
}) => {
  const activeAdapter = adapter || globalBankModuleConfig?.adapter || createRestBankAdapter();

  const value: BankModuleContextValue = {
    adapter: activeAdapter,
    appName,
    baseRoute,
    onNotify: onNotify || globalBankModuleConfig?.onNotify,
  };

  return <BankModuleContext.Provider value={value}>{children}</BankModuleContext.Provider>;
};

export function useBankModule(): BankModuleContextValue {
  const ctx = useContext(BankModuleContext);
  if (ctx) return ctx;
  if (globalBankModuleConfig) return globalBankModuleConfig;

  return {
    adapter: createRestBankAdapter(),
    appName: 'Webakus ERP',
    baseRoute: '/bankalar',
  };
}
