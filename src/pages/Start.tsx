import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sprout, Store } from 'lucide-react';
import { useApp } from '../store';
import { pick, type Key } from '../i18n';
import type { Role } from '../types';

/** Seed accounts used by "try with a sample account". */
const SAMPLE: Record<Role, string> = { buyer: 'b1', farmer: 'f1' };

/** First screen: ask who the visitor is, then send them to the one place their first step happens. */
export default function Start() {
  const { me, lang, t, setUser } = useApp();
  const navigate = useNavigate();

  const trySample = (role: Role) => {
    setUser(SAMPLE[role]);
    navigate('/me');
  };

  const roles: { role: Role; Icon: typeof Store; keys: Key[] }[] = [
    { role: 'buyer', Icon: Store, keys: ['start_b1', 'start_b2', 'start_b3'] },
    { role: 'farmer', Icon: Sprout, keys: ['start_f1', 'start_f2', 'start_f3'] },
  ];

  return (
    <>
      <section className="start-head">
        <h1>{t('start_title')}</h1>
        <p className="lede">{t('start_lede')}</p>
      </section>

      <h2 className="start-ask">{t('start_ask')}</h2>
      <div className="roles">
        {roles.map(({ role, Icon, keys }) => (
          <section key={role} className={`role-card role-${role}`}>
            <Icon size={36} strokeWidth={1.75} aria-hidden className="role-icon" />
            <h3>{t(role === 'buyer' ? 'start_buyer' : 'start_farmer')}</h3>
            <p className="role-want">{t(role === 'buyer' ? 'start_buyer_want' : 'start_farmer_want')}</p>
            <ol className="role-steps">
              {keys.map((k) => <li key={k}>{t(k)}</li>)}
            </ol>
            <div className="role-actions">
              <Link className="btn big" to={`/join?role=${role}`}>{t(role === 'buyer' ? 'start_join_b' : 'start_join_f')} <ArrowRight size={18} aria-hidden /></Link>
              <button className="btn secondary" onClick={() => trySample(role)}>{t('start_try')}</button>
            </div>
          </section>
        ))}
      </div>

      <div className="start-foot">
        <Link to="/me" className="continue">
          {t('start_continue', { name: pick(me.name, lang) })} <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to="/how">{t('start_how')}</Link>
      </div>
    </>
  );
}
