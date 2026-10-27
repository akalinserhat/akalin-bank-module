/**
 * @akalin/bank_module - Banka Şubeleri Sayfası (BankaSubeleriPage.tsx)
 * Seçilen bankaya ait TCMB şube kayıtlarını listeleyen, arama ve filtreleme sunan,
 * BaseSystemPage ve BaseCard temel bileşenlerinden türetilmiş yönetim sayfasıdır.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, ArrowLeft, RefreshCcw, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BaseSystemPage, BaseCard } from '@akalin/ui';
import { useBankModule } from '../adapters/BankServiceContext';
import { BankaDTO, BankaSubeDTO } from '../types';

export interface BankaSubeleriPageProps {
  baseRoute?: string;
}

export const BankaSubeleriPage: React.FC<BankaSubeleriPageProps> = ({ baseRoute: propBaseRoute }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { adapter, onNotify, baseRoute: ctxBaseRoute } = useBankModule();

  const baseRoute = useMemo(() => {
    if (propBaseRoute) return propBaseRoute;
    const path = location?.pathname || '';
    if (path.startsWith('/ayarlar/BankalarVeSubeler')) return '/ayarlar/BankalarVeSubeler';
    if (path.startsWith('/ayarlar/bankalar')) return '/ayarlar/bankalar';
    return ctxBaseRoute || '/bankalar';
  }, [propBaseRoute, ctxBaseRoute, location?.pathname]);

  const [banka, setBanka] = useState<BankaDTO | null>(null);
  const [subeler, setSubeler] = useState<BankaSubeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<Record<string | number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return sessionStorage.getItem(`banka_subeleri_search_${id}`) || '';
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

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bankRes, subeRes] = await Promise.all([
        adapter.getBankById(id),
        adapter.getBranchesByBankId(id),
      ]);
      setBanka(bankRes);
      setSubeler(Array.isArray(subeRes) ? subeRes : []);
    } catch (err) {
      console.error('Veriler yüklenemedi', err);
      notify('error', t('subeler_yuklenirken_hata', 'Şubeler yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, adapter]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      sessionStorage.setItem(`banka_subeleri_search_${id}`, searchTerm || '');
    } catch {}
  }, [searchTerm, id]);

  const handleToggleAktif = async (e: React.MouseEvent, subeId: number | string) => {
    e.stopPropagation();
    try {
      setToggleLoading((prev) => ({ ...prev, [subeId]: true }));
      const res = await adapter.toggleBranchActive(subeId);
      notify('success', res.mesaj);

      setSubeler((prev) =>
        prev.map((s) => (String(s.id) === String(subeId) ? { ...s, aktifMi: res.aktifMi } : s))
      );
    } catch (err: any) {
      notify('error', err?.message || t('durum_degistirilirken_hata', 'Durum değiştirilirken hata oluştu.'));
      console.error(err);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [subeId]: false }));
    }
  };

  const handleGoBack = () => {
    try {
      sessionStorage.setItem(`banka_subeleri_search_${id}`, searchTerm || '');
    } catch {}
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(baseRoute);
    }
  };

  const searchableFields = useMemo(
    () => [
      {
        id: 'Tumu',
        label: t('tumu', 'Tümü'),
        type: 'text' as const,
        placeholder: t('sube_arama_placeholder', 'Şube adı veya kodu ara...'),
      },
    ],
    [t]
  );

  const filteredSubeler = useMemo(() => {
    const term = (searchTerm || '').toLocaleLowerCase('tr-TR').trim();
    if (!term) return subeler;
    return subeler.filter(
      (s) =>
        (s.subeAdi && s.subeAdi.toLocaleLowerCase('tr-TR').includes(term)) ||
        (s.subeKodu && String(s.subeKodu).includes(term))
    );
  }, [subeler, searchTerm]);

  return (
    <BaseSystemPage
      title={
        banka?.ad
          ? t('banka_subeleri_baslik', '{{ad}} Şubeleri', { ad: banka.ad })
          : t('banka_subeleri', 'Banka Şubeleri')
      }
      subtitle={t('sube_listeleniyor_adet', '{{count}} şube listeleniyor', {
        count: filteredSubeler.length,
      })}
      icon={<Building2 size={26} />}
      customHeaderActions={
        <button
          type="button"
          onClick={handleGoBack}
          className="btn btn-secondary flex-row items-center gap-8"
        >
          <ArrowLeft size={18} />
          <span>{t('geri_don', 'Geri Dön')}</span>
        </button>
      }
      searchTerm={searchTerm}
      searchPlaceholder={t('sube_arama_placeholder', 'Şube adı veya kodu ara...')}
      searchableFields={searchableFields}
      onSearchChange={(term) => setSearchTerm(term)}
      headerSync={false}
      baseRoute={baseRoute}
    >
      {loading ? (
        <div className="glass-card loading-state flex-col items-center justify-center p-40">
          <RefreshCcw size={36} className="spinning loading-icon mb-12" />
          <p className="text-secondary">{t('subeler_yukleniyor', 'Şubeler yükleniyor...')}</p>
        </div>
      ) : filteredSubeler.length === 0 ? (
        <div className="glass-card empty-state flex-col items-center justify-center p-40 text-center">
          <div className="empty-icon-wrap mb-12">
            <MapPin size={40} className="text-secondary" />
          </div>
          <h3 className="font-semibold mb-8">{t('eslesen_sube_bulunamadi', 'Eşleşen Şube Bulunamadı')}</h3>
          <p className="text-secondary">{t('arama_uygun_sube_yok', 'Aramanıza uygun şube bulunamadı.')}</p>
        </div>
      ) : (
        <div className="subeler-grid">
          {filteredSubeler.map((sube) => (
            <BaseCard
              key={sube.id}
              variant="elevated"
              className={`sube-card-item ${!sube.aktifMi ? 'is-passive' : ''}`}
            >
              <div className="sube-card-content">
                <div className="sube-card-info-wrap">
                  <div className="sube-card-avatar" aria-hidden="true">
                    <MapPin size={20} />
                  </div>
                  <div className="sube-card-texts">
                    <div className={`sube-card-title ${!sube.aktifMi ? 'is-passive' : ''}`}>
                      {sube.subeAdi}
                    </div>
                    <div className="sube-card-code-line">
                      {t('sube_kodu', 'Şube Kodu')}:{' '}
                      <span className="sube-card-code-val">{sube.subeKodu}</span>
                    </div>
                  </div>
                </div>

                <div className="sube-card-actions">
                  <button
                    type="button"
                    onClick={(e) => handleToggleAktif(e, sube.id)}
                    disabled={toggleLoading[sube.id]}
                    className={`sube-status-btn ${sube.aktifMi ? 'status-active' : 'status-passive'}`}
                    title={sube.aktifMi ? t('pasife_al', 'Pasife Al') : t('aktife_al', 'Aktife Al')}
                  >
                    {sube.aktifMi ? t('aktif', 'Aktif') : t('pasif', 'Pasif')}
                  </button>
                </div>
              </div>
            </BaseCard>
          ))}
        </div>
      )}
    </BaseSystemPage>
  );
};

export default BankaSubeleriPage;
