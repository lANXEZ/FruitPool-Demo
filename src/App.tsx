import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { BarChart3, Citrus, CircleHelp, Handshake, ListChecks, Sprout, Store, Users, type LucideIcon } from 'lucide-react';
import { useApp } from './store';
import { pick, type Key } from './i18n';
import { needsYou, useTracks } from './lib/journey';
import Start from './pages/Start';
import Me from './pages/Me';
import How from './pages/How';
import Board from './pages/Board';
import Pools from './pages/Pools';
import Deals from './pages/Deals';
import Insights from './pages/Insights';
import Join from './pages/Join';
import DemoPanel from './components/DemoPanel';

interface NavItem {
  to: string;
  Icon: LucideIcon;
  label: Key; // full label (desktop)
  short: Key; // bottom tab bar on phones
  phone?: false; // left out of the phone tab bar
  iconOnly?: true; // desktop shows just the icon (label stays for screen readers and as a tooltip)
}

/** Menus named after what each role is doing. Shops don't get Insights: it is the farmers' market view. */
const NAV: Record<'buyer' | 'farmer', NavItem[]> = {
  buyer: [
    { to: '/me', Icon: ListChecks, label: 'nav_me_b', short: 'tab_me' },
    { to: '/board', Icon: Store, label: 'nav_board', short: 'tab_board' },
    { to: '/pools', Icon: Users, label: 'nav_pools_b', short: 'tab_pools_b' },
    { to: '/deals', Icon: Handshake, label: 'nav_deals', short: 'tab_deals' },
    { to: '/how', Icon: CircleHelp, label: 'nav_how', short: 'tab_how', iconOnly: true },
  ],
  farmer: [
    { to: '/me', Icon: ListChecks, label: 'nav_me_f', short: 'tab_me' },
    { to: '/board', Icon: Store, label: 'nav_board', short: 'tab_board' },
    { to: '/pools', Icon: Users, label: 'nav_pools_f', short: 'tab_pools_f' },
    { to: '/deals', Icon: Handshake, label: 'nav_deals', short: 'tab_deals' },
    { to: '/insights', Icon: BarChart3, label: 'nav_insights', short: 'tab_insights' },
    { to: '/how', Icon: CircleHelp, label: 'nav_how', short: 'tab_how', phone: false, iconOnly: true },
  ],
};

export default function App() {
  const { me, lang, t, setLang } = useApp();
  const todo = useTracks().tracks.filter(needsYou).length;
  const items = NAV[me.role];

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="wordmark" aria-label="FRUITPOOL">
            <Citrus size={22} strokeWidth={2.25} aria-hidden /> FRUITPOOL
          </NavLink>
          {/* Desktop: a row in the header. Phones: a tab bar fixed to the bottom of the screen. */}
          <nav className="nav" aria-label={t('menu')}>
            {items.map(({ to, Icon, label, short, phone, iconOnly }) => (
              <NavLink
                key={to}
                to={to}
                className={[phone === false && 'no-phone', iconOnly && 'icon-only'].filter(Boolean).join(' ') || undefined}
                title={iconOnly ? t(label) : undefined}
              >
                <Icon size={18} aria-hidden className="nav-icon" />
                <span className="lbl-long">{t(label)}</span>
                <span className="lbl-short" aria-hidden>{t(short)}</span>
                {to === '/me' && todo > 0 && <span className="count" aria-label={t('n_todo', { n: todo })}>{todo}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-tools">
            <NavLink to="/me" className="userchip" title={t('nav_me')}>
              {me.role === 'buyer' ? <Store size={16} aria-hidden /> : <Sprout size={16} aria-hidden />}
              <span>{pick(me.name, lang)}</span>
            </NavLink>
            <div className="langswitch" role="group" aria-label="Language">
              <button aria-pressed={lang === 'th'} onClick={() => setLang('th')}>ไทย</button>
              <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/me" element={<Me />} />
          <Route path="/how" element={<How />} />
          <Route path="/board" element={<Board />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/join" element={<Join />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-foot">
        <NavLink to="/how">{t('nav_how')}</NavLink> · {t('demo_note')}
      </footer>
      <DemoPanel />
    </>
  );
}
