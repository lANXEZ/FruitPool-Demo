import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Citrus, RotateCcw } from 'lucide-react';
import { useApp } from './store';
import { pick } from './i18n';
import Home from './pages/Home';
import Board from './pages/Board';
import Pools from './pages/Pools';
import Deals from './pages/Deals';
import Insights from './pages/Insights';

export default function App() {
  const { state, lang, t, setLang, setUser, reset } = useApp();
  const buyers = state.users.filter((u) => u.role === 'buyer');
  const farmers = state.users.filter((u) => u.role === 'farmer');

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="wordmark" aria-label="FRUITPOOL">
            <Citrus size={22} strokeWidth={2.25} aria-hidden /> FRUITPOOL
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>{t('nav_home')}</NavLink>
            <NavLink to="/board">{t('nav_board')}</NavLink>
            <NavLink to="/pools">{t('nav_pools')}</NavLink>
            <NavLink to="/deals">{t('nav_deals')}</NavLink>
            <NavLink to="/insights">{t('nav_insights')}</NavLink>
          </nav>
          <div className="topbar-tools">
            <label className="row small">
              <span>{t('view_as')}</span>
              <select value={state.currentUserId} onChange={(e) => setUser(e.target.value)}>
                <optgroup label={t('buyers')}>
                  {buyers.map((u) => <option key={u.id} value={u.id}>{pick(u.name, lang)}</option>)}
                </optgroup>
                <optgroup label={t('farmers')}>
                  {farmers.map((u) => <option key={u.id} value={u.id}>{pick(u.name, lang)}</option>)}
                </optgroup>
              </select>
            </label>
            <div className="langswitch" role="group" aria-label="Language">
              <button aria-pressed={lang === 'th'} onClick={() => setLang('th')}>ไทย</button>
              <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            </div>
            <button className="ghost" onClick={reset} title={t('reset')}>
              <span className="row"><RotateCcw size={14} aria-hidden /> {t('reset')}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="demo-note">{t('demo_note')}</div>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board" element={<Board />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
