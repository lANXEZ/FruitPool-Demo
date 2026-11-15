import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Citrus, Sprout, Store } from 'lucide-react';
import { useApp } from './store';
import { pick } from './i18n';
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

export default function App() {
  const { me, lang, t, setLang } = useApp();
  const todo = useTracks().tracks.filter(needsYou).length;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="wordmark" aria-label="FRUITPOOL">
            <Citrus size={22} strokeWidth={2.25} aria-hidden /> FRUITPOOL
          </NavLink>
          <nav className="nav">
            <NavLink to="/me">
              {t('nav_me')}
              {todo > 0 && <span className="count" aria-label={t('n_todo', { n: todo })}>{todo}</span>}
            </NavLink>
            <NavLink to="/board">{t('nav_board')}</NavLink>
            <NavLink to="/pools">{t('nav_pools')}</NavLink>
            <NavLink to="/deals">{t('nav_deals')}</NavLink>
            <NavLink to="/insights">{t('nav_insights')}</NavLink>
            <NavLink to="/how">{t('nav_how')}</NavLink>
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
      <footer className="site-foot">{t('demo_note')}</footer>
      <DemoPanel />
    </>
  );
}
