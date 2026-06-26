import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './RightPanel.css'
export default function RightPanel(){
  const [leaders,setLeaders]=useState([])
  const [stats,setStats]=useState(null)
  useEffect(()=>{
    supabase.from('leaderboard_weekly').select('*').limit(5).then(({data})=>setLeaders(data??[]))
    supabase.from('community_stats_today').select('*').single().then(({data})=>setStats(data))
  },[])
  return(
    <aside className="right-panel">
      <section className="rp-section">
        <h2 className="rp-title">Top traders · this week</h2>
        {leaders.length===0?<div className="rp-empty">No trades this week yet.</div>
          :leaders.map((l,i)=>(
            <div key={l.user_id} className="rp-leader">
              <span className="rp-rank">{i+1}</span>
              <div className="rp-leader-avatar">{l.username?.slice(0,2).toUpperCase()}</div>
              <span className="rp-leader-name">{l.username}</span>
              <span className={`rp-leader-pnl ${l.total_pnl>=0?'green':'red'}`}>{l.total_pnl>=0?'+':''} ${Number(l.total_pnl).toLocaleString()}</span>
            </div>
          ))}
      </section>
      <section className="rp-section">
        <h2 className="rp-title">Today's community</h2>
        <div className="rp-stats-grid">
          <div className="rp-stat"><div className="rp-stat-label">Trades posted</div><div className="rp-stat-val">{stats?.posts_today??'—'}</div></div>
          <div className="rp-stat"><div className="rp-stat-label">Win rate avg</div><div className="rp-stat-val green">{stats?.win_rate_pct!=null?`${stats.win_rate_pct}%`:'—'}</div></div>
          <div className="rp-stat"><div className="rp-stat-label">Upvotes given</div><div className="rp-stat-val">{stats?.upvotes_given??'—'}</div></div>
          <div className="rp-stat"><div className="rp-stat-label">Active traders</div><div className="rp-stat-val">{stats?.active_traders??'—'}</div></div>
        </div>
      </section>
    </aside>
  )
}
