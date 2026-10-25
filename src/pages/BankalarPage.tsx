/**
 * @akalin/bank_module - Sistem Bankaları Sayfası (BankalarPage.tsx)
 * TCMB resmi banka listesini sunar; arama, filtreleme ve canlı TCMB senkronizasyonu sağlar.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DownloadCloud, Building2, MapPin, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseSystemPage, BaseCard, SyncProgressModal } from '@akalin/ui';
import { useBankModule } from '../adapters/BankServiceContext';
import { BankaDTO } from '../types';

export interface BankalarPageProps {
  baseRoute?: string;
}

export const BankalarPage: React.FC<BankalarPageProps> = ({ baseRoute = '/bankalar' }) => {
  const { t } = useTranslation();
  const { adapter, onNotify } = useBankModule();

  const [banks, setBanks] = useState<BankaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return sessionStorage.getItem('bankalar_search') || '';
    } catch {
      return '';
    }
  });

  const isInitialMount = useRef(true);

  const notify = (type: 'success' | 'error' | 'info' | 'warning', msg: string) => {
    if (onNotify) {
      onNotify(type, msg);
    } else if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const data = await adapter.getBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (error) {
      notify('error', t('bankalar_yuklenirken_hata', 'Bankalar yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [adapter]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      sessionStorage.setItem('bankalar_search', searchTerm || '');
    } catch {}
  }, [searchTerm]);

  const handleSyncAll = async () => {
    setIsSyncModalOpen(true);
    try {
      await adapter.syncTcmbAll();
    } catch (error) {
      console.error('Senkronizasyon başlatılamadı:', error);
    }
  };

  const handleModalClose = () => {
    setIsSyncModalOpen(false);
    fetchBanks();
  };

  const searchableFields = useMemo(
    () => [
      {
        id: 'Tumu',
        label: t('tumu', 'Tümü'),
        type: 'text' as const,
        placeholder: t('banka_arama_placeholder', 'Banka veya EFT Kodu ara...'),
      },
    ],
    [t]
  );

  const filteredBanks = useMemo(() => {
    const term = (searchTerm || '').toLocaleLowerCase('tr-TR').trim();
    if (!term) return banks;
    return banks.filter(
      (b) =>
        (b.ad && b.ad.toLocaleLowerCase('tr-TR').includes(term)) ||
        (b.kod && String(b.kod).includes(term))
    );
  }, [banks, searchTerm]);

  return (
    <BaseSystemPage
      title={t('sistem_bankalari', 'Sistem Bankaları')}
      subtitle={t('sistem_bankalari_aciklama', 'Tüm firmaların ortak kullandığı resmi banka listesi')}
      icon={<Building2 size={26} />}
      customHeaderActions={
        <button
          type="button"
          className="btn btn-primary flex-row items-center gap-8"
          onClick={handleSyncAll}
        >
          <DownloadCloud size={18} />
          <span>{t('bankalari_ve_subeleri_guncelle', 'Bankaları ve Şubeleri Güncelle')}</span>
        </button>
      }
      searchTerm={searchTerm}
      searchPlaceholder={t('banka_arama_placeholder', 'Banka veya EFT Kodu ara...')}
      searchableFields={searchableFields}
      onSearchChange={(term) => setSearchTerm(term)}
      headerSync={false}
      baseRoute={baseRoute}
    >
      <SyncProgressModal isOpen={isSyncModalOpen} onClose={handleModalClose} />

      {loading ? (
        <div className="glass-card loading-state flex-col items-center justify-center p-40">
          <RefreshCcw size={36} className="spinning loading-icon mb-12 text-secondary" />
          <p className="text-secondary">{t('bankalar_yukleniyor', 'Bankalar yükleniyor...')}</p>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="glass-card empty-state flex-col items-center justify-center p-40 text-center">
          <div className="empty-icon-wrap mb-12">
            <Building2 size={40} className="text-secondary" />
          </div>
          <h3 className="font-semibold mb-8">{t('eslesen_banka_bulunamadi', 'Eşleşen Banka Bulunamadı')}</h3>
          <p className="text-secondary">
            {searchTerm && searchTerm.trim()
              ? t('arama_kriterine_uygun_modul_bulunamadi', '"{{term}}" arama kriterine uygun banka bulunamadı.', {
                  term: searchTerm,
                })
              : t(
                  'banka_bulunamadi_aciklama',
                  "Henüz banka bulunmuyor veya aramaya uygun sonuç yok. Yukarıdan TCMB'den Güncelle butonuna basarak listeyi doldurabilirsiniz."
                )}
          </p>
        </div>
      ) : (
        <div className="bankalar-grid">
          {filteredBanks.map((bank) => (
            <BankaCard
              key={bank.id}
              bank={bank}
              searchTerm={searchTerm}
              baseRoute={baseRoute}
            />
          ))}
        </div>
      )}
    </BaseSystemPage>
  );
};

export interface BankaCardProps {
  bank: BankaDTO;
  searchTerm?: string;
  baseRoute?: string;
}

export const BankaCard: React.FC<BankaCardProps> = ({ bank, searchTerm, baseRoute = '/bankalar' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigate = () => {
    try {
      sessionStorage.setItem('bankalar_search', searchTerm || '');
    } catch {}
    navigate(`${baseRoute}/${bank.id}/subeler`);
  };

  return (
    <BaseCard
      variant="elevated"
      interactive
      onClick={handleNavigate}
      className="banka-card-item"
    >
      <div className="banka-card-content">
        <div className="banka-card-info-wrap">
          <div className="banka-card-avatar" aria-hidden="true">
            <Building2 size={24} />
          </div>
          <div className="banka-card-texts">
            <div className="banka-card-title" title={bank.ad}>
              {bank.ad}
            </div>
            <div className="banka-card-code-line">
              {t('eft_kodu', 'EFT Kodu')}: <span className="banka-card-code-val">{bank.kod}</span>
            </div>
          </div>
        </div>

        <div className="banka-card-actions">
          <button
            type="button"
            className="banka-subeler-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            <MapPin size={14} />
            <span>{t('subeleri_gor', 'Şubeleri Gör')}</span>
          </button>
        </div>
      </div>
    </BaseCard>
  );
};

export default BankalarPage;
