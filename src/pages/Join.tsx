import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { pick } from '../i18n';
import { BUYER_KINDS, FARMER_KINDS, REGIONS, ZONES } from '../catalog';
import type { RegionId, Role, ZoneId } from '../types';

export default function Join() {
  const { lang, t, addUser } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('buyer');
  const [name, setName] = useState('');
  const [kind, setKind] = useState(0);
  const [zone, setZone] = useState<ZoneId>('ari');
  const [region, setRegion] = useState<RegionId>('central');

  const kinds = role === 'buyer' ? BUYER_KINDS : FARMER_KINDS;
  const chooseRole = (r: Role) => {
    setRole(r);
    setKind(0);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const base = { role, name: { th: n, en: n }, kind: kinds[kind] };
    addUser(role === 'buyer' ? { ...base, zone } : { ...base, region });
    navigate('/board');
  };

  return (
    <>
      <div className="page-head">
        <h1>{t('join_title')}</h1>
        <p>{t('join_lede')}</p>
      </div>

      <form className="panel form" style={{ maxWidth: 760 }} onSubmit={submit}>
        <fieldset className="full" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{t('join_as')}</legend>
          <div className="row" role="group">
            <button type="button" className="chip" aria-pressed={role === 'buyer'} onClick={() => chooseRole('buyer')}>{t('join_buyer')}</button>
            <button type="button" className="chip" aria-pressed={role === 'farmer'} onClick={() => chooseRole('farmer')}>{t('join_farmer')}</button>
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="jn">{t('f_name')}</label>
          <input id="jn" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="jk">{t('f_kind')}</label>
          <select id="jk" value={kind} onChange={(e) => setKind(Number(e.target.value))}>
            {kinds.map((k, i) => <option key={k.en} value={i}>{pick(k, lang)}</option>)}
          </select>
        </div>
        {role === 'buyer' ? (
          <div className="field">
            <label htmlFor="jz">{t('f_zone')}</label>
            <select id="jz" value={zone} onChange={(e) => setZone(e.target.value as ZoneId)}>
              {(Object.keys(ZONES) as ZoneId[]).map((x) => <option key={x} value={x}>{pick(ZONES[x], lang)}</option>)}
            </select>
            <span className="hint">{t('f_zone_hint')}</span>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="jr">{t('ships_from')}</label>
            <select id="jr" value={region} onChange={(e) => setRegion(e.target.value as RegionId)}>
              {(Object.keys(REGIONS) as RegionId[]).map((x) => <option key={x} value={x}>{pick(REGIONS[x], lang)}</option>)}
            </select>
            <span className="hint">{t('f_region_hint')}</span>
          </div>
        )}
        <div className="full row">
          <button className="btn" type="submit">{t('join_submit')}</button>
          <button className="btn secondary" type="button" onClick={() => navigate(-1)}>{t('cancel')}</button>
        </div>
      </form>
    </>
  );
}
