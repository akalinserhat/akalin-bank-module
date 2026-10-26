/**
 * @akalin/bank_module - Tescilli Kart ve Belge Tanımları (entities.ts)
 * Modüle ait tüm kartlar, belgeler ve raporlar bu kütükte register edilir.
 * Bu kütükte tescil edilmemiş hiçbir liste, kart veya belge menüde gösterilmez ve açılamaz.
 */

import type { IModuleEntityDefinition } from '@akalin/module_core';

export const bankCards: IModuleEntityDefinition[] = [
  {
    id: 'bankalar-karti',
    category: 'kart',
    titleKey: 'Banka Kartı',
    title: 'Banka Kartı',
    description: 'TCMB resmi bankaları ve şube listesi',
    route: '/bankalar',
    listRoute: '/bankalar',
    formRoute: '/bankalar/:id',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true
  },
  {
    id: 'banka-subeleri',
    category: 'kart',
    titleKey: 'Banka Şubeleri',
    title: 'Banka Şubeleri',
    description: 'Bankalara ait şube ve il/ilçe lokasyonları',
    route: '/bankalar/:id/subeler',
    listRoute: '/bankalar/:id/subeler',
    formRoute: '/bankalar/:id/subeler/:subeId',
    useStandardCrud: true,
    showInMenu: true,
    isRegistered: true
  }
];

export const bankDocuments: IModuleEntityDefinition[] = [];

export const bankOperations: IModuleEntityDefinition[] = [
  {
    id: 'banka-islem',
    category: 'islem',
    titleKey: 'Banka ve Şube İşlemleri',
    title: 'Banka ve Şube İşlemleri',
    description: 'TCMB resmi web servisinden canlı veri eşitleme ve şube durum işlemleri',
    useStandardCrud: false,
    showInMenu: false,
    isRegistered: true,
    customActions: [
      {
        action: 'sync',
        labelKey: "TCMB'den Bankaları ve Şubeleri Güncelleme",
        description: 'TCMB resmi web servisinden tüm banka ve şube verilerini çekip eşitleme yetkisi.'
      },
      {
        action: 'toggle_branch',
        labelKey: 'Şube Aktiflik Durumunu Değiştirme',
        description: 'Banka şubesinin sistemde aktif veya pasif durumunu değiştirme yetkisi.'
      }
    ]
  }
];

export const bankReports: IModuleEntityDefinition[] = [];

export const bankEntities: IModuleEntityDefinition[] = [
  ...bankCards,
  ...bankDocuments,
  ...bankOperations,
  ...bankReports
];

export default bankEntities;
