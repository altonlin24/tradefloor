import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'
const MARKETS = [{sym:'NQ',name:'Nasdaq 100'},{sym:'ES',name:'S&P 500'},{sym:'GC',name:'Gold'},{sym:'SI',name:'Silver'}]
export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  async function handleSignOut() { await signOut(); navigate('/auth') }
  const initials = profile?.username ? profile.username.slice(0,2).toUpperCase() : '?'
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><span className="sidebar-logo-icon">↗</span><div><div className="sidebar-logo-name">TradeFloor</div><div className="sidebar-logo-sub">Futures community</div></div></div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({isActive})=>isActive?'nav-item active':'nav-item'}><span className="nav-icon">⌂</span> Feed</NavLink>
        <NavLink to={`/profile/${profile?.username}`} className={({isActive})=>isActive?'nav-item active':'nav-item'}><span className="nav-icon">◯</span> Profile</NavLink>
      </nav>
      <div className="sidebar-section-label">Markets</div>
      <div className="sidebar-markets">
        {MARKETS.map(m=>(
          <div key={m.sym} className="market-item">
            <span className={`market-dot dot-${m.sym}`}/><span className="market-sym">{m.sym}</span><span className="market-name">{m.name}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-section-label">You</div>
      <NavLink to={`/profile/${profile?.username}`} className="nav-item"><span className="nav-icon">≡</span> My trades</NavLink>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user"><div className="sidebar-username">{profile?.username??'—'}</div><button className="sidebar-signout" onClick={handleSignOut}>Sign out</button></div>
      </div>
    </aside>
  )
}
