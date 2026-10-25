/**
 * @akalin/bank_module - Modül Fabrikası (createBankModule.tsx)
 * @akalin/module_core ModuleRegistry ile tam uyumlu IModuleDefinition üretir.
 */

import React from 'react';
import { Landmark, Building2, DownloadCloud, ToggleLeft } from 'lucide-react';
import type { IModuleDefinition } from '@akalin/module_core';
import { CreateBankModuleOptions } from './types';
import {
  createRestBankAdapter,
  setGlobalBankModuleConfig,
  BankModuleProvider,
} from './adapters/BankServiceContext';

import BankalarPageComponent, { BankaCard } from './pages/BankalarPage';
import BankaSubeleriPageComponent from './pages/BankaSubeleriPage';

export function createBankModule(options?: CreateBankModuleOptions): IModuleDefinition {
  const id = options?.id || 'bankalar_ve_subeler_modulu';
  const appName = options?.appName || 'Webakus ERP';
  const baseRoute = (options?.baseRoute || '/bankalar').replace(/\/$/, '');
  const settingsModuleId = options?.settingsModuleId || 'BankalarVeSubeler';

  const adapter = options?.adapter || createRestBankAdapter();

  setGlobalBankModuleConfig({
    adapter,
    appName,
    baseRoute,
    onNotify: options?.onNotify,
  });

  // Lazy / Connected Sayfa Sarıcıları
  const ConnectedBankalarPage: React.FC<any> = (props) => (
    <BankModuleProvider adapter={adapter} appName={appName} baseRoute={baseRoute} onNotify={options?.onNotify}>
      <BankalarPageComponent {...props} baseRoute={baseRoute} />
    </BankModuleProvider>
  );

  const ConnectedBankaSubeleriPage: React.FC<any> = (props) => (
    <BankModuleProvider adapter={adapter} appName={appName} baseRoute={baseRoute} onNotify={options?.onNotify}>
      <BankaSubeleriPageComponent {...props} baseRoute={baseRoute} />
    </BankModuleProvider>
  );

  return {
    id,
    title: 'Bankalar & Şubeler',
    name: 'Bankalar & Şubeler',
    description:
      'TCMB resmi banka listesi ve sistemde tanımlı banka şubelerinin yönetimi ve canlı senkronizasyonu.',
    version: '1.0.0',
    permissionPrefix: 'bank',
    icon: React.createElement(Landmark, { size: 20 }),
    iconName: 'Landmark',
    order: options?.order ?? 48,
    isCore: true,
    defaultActive: true,
    routes: [
      {
        path: '/bankalar',
        element: React.createElement(ConnectedBankalarPage),
        title: 'Sistem Bankaları',
      },
      {
        path: '/bankalar/:id/subeler',
        element: React.createElement(ConnectedBankaSubeleriPage),
        title: 'Banka Şubeleri',
      },
      {
        path: '/ayarlar/bankalar',
        element: React.createElement(ConnectedBankalarPage),
        title: 'Sistem Bankaları',
      },
      {
        path: '/ayarlar/bankalar/:id/subeler',
        element: React.createElement(ConnectedBankaSubeleriPage),
        title: 'Banka Şubeleri',
      },
      {
        path: '/ayarlar/BankalarVeSubeler',
        element: React.createElement(ConnectedBankalarPage),
        title: 'Bankalar & Şubeler',
      },
    ],
    menuItems: [],
    settingsModules: [
      {
        id: settingsModuleId,
        name: 'Bankalar & Şubeler',
        desc: 'TCMB resmi banka listesi ve sistemde tanımlı banka şubelerinin yönetimi',
        icon: React.createElement(Landmark, { size: 28 }),
        order: 48,
        hasOwnLayout: true,
        component: ConnectedBankalarPage,
      },
    ],
    cards: [
      {
        id: 'bankalar-karti',
        category: 'kart',
        titleKey: 'Banka Kartı',
        route: '/bankalar',
      },
    ],
    operations: [
      {
        id: 'banka-islem',
        category: 'islem',
        titleKey: 'Banka ve Şube İşlemleri',
        useStandardCrud: false,
        customActions: [
          {
            action: 'sync',
            labelKey: "TCMB'den Bankaları ve Şubeleri Güncelleme",
            description: "TCMB resmi web servisinden tüm banka ve şube verilerini çekip eşitleme yetkisi.",
          },
          {
            action: 'toggle_branch',
            labelKey: 'Şube Aktiflik Durumunu Değiştirme',
            description: 'Banka şubesinin sistemde aktif veya pasif durumunu değiştirme yetkisi.',
          },
        ],
      },
    ],
    permissions: [
      {
        key: 'bank.view',
        name: 'Bankaları ve Şubeleri Görüntüleme',
        description: 'Sistem bankalarını ve şube kayıtlarını listeleme yetkisi.',
        group: 'Banka & Finans',
      },
      {
        key: 'bank.sync',
        name: 'TCMB Banka & Şube Senkronizasyonu',
        description: "TCMB resmi web servisinden bankaları ve şubeleri senkronize etme yetkisi.",
        group: 'Banka & Finans',
      },
      {
        key: 'bank.branch_toggle',
        name: 'Şube Aktiflik Yönetimi',
        description: 'Banka şubelerini aktife veya pasife alma yetkisi.',
        group: 'Banka & Finans',
      },
    ],
    components: {
      BankalarPage: BankalarPageComponent,
      BankaSubeleriPage: BankaSubeleriPageComponent,
      BankaCard,
    },
    promotion: {
      title: 'Banka ve Şube Yönetimi Modülü',
      subtitle: 'TCMB resmi banka ve şube entegrasyonu ile kusursuz banka hesap ve EFT yönetimi.',
      description:
        'Tüm resmi Türkiye bankalarını, EFT kodlarını ve şube kayıtlarını tek merkezden yönetin, canlı TCMB güncellemesi ile daima güncel kalın.',
      icon: 'Landmark',
      benefits: [
        'Resmi TCMB web servisleri ile tek tıkla otomatik eşitleme',
        'Tüm şubeler için hızlı arama ve filtreleme',
        'Şube bazlı aktiflik/pasiflik kontrolü',
        'Cari ve Finans modülleriyle doğrudan entegre banka seçimi',
      ],
    },
  };
}

export const BankalarVeSubelerModulu = createBankModule();
export default BankalarVeSubelerModulu;
