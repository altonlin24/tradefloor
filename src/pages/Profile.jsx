import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/feed/PostCard'
import './Profile.css'
export default function Profile(){
  const {username}=useParams()
  const {profile:myProfile}=useAuth()
  const [profile,setProfile]=useState(null)
  const [posts,setPosts]=useState([])
  const [stats,setStats]=useState({total:0,wins:0,totalPnl:0})
  const [loading,setLoading]=useState(true)
  useEffect(()=>{if(username)load()},[username])
  async function load(){
    setLoading(true)
    const {data:user}=await supabase.from('users').select('*').eq('username',username).single()
    if(!user){setLoading(false);return}
    setProfile(user)
    const {data:p}=await supabase.from('posts_feed').select('*').eq('username',username).order('created_at',{ascending:false})
    const posts=p??[]
    setPosts(posts)
    const withPnl=posts.filter(x=>x.pnl!=null)
    setStats({total:posts.length,wins:withPnl.filter(x=>x.pnl>0).length,totalPnl:withPnl.reduce((s,x)=>s+Number(x.pnl),0)})
    setLoading(false)
  }
  const isOwn=myProfile?.username===username
  const initials=profile?.username?.slice(0,2).toUpperCase()??'?'
  const winRate=stats.total>0?Math.round((stats.wins/stats.total)*100):null
  if(loading)return <div className="profile-loading">Loading profile...</div>
  if(!profile)return <div className="profile-loading">User not found.</div>
  return(
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-info">
          <h1 className="profile-username">{profile.username}</h1>
          {profile.bio&&<p className="profile-bio">{profile.bio}</p>}
          <div className="profile-joined">Joined {new Date(profile.created_at).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
        </div>
      </div>
      <div className="profile-stats">
        <div className="profile-stat"><div className="profile-stat-val">{stats.total}</div><div className="profile-stat-label">Trades posted</div></div>
        <div className="profile-stat"><div className={`profile-stat-val ${stats.totalPnl>=0?'green':'red'}`}>{stats.totalPnl>=0?'+':''} ${stats.totalPnl.toLocaleString()}</div><div className="profile-stat-label">Total P&L</div></div>
        <div className="profile-stat"><div className="profile-stat-val">{winRate!=null?`${winRate}%`:'—'}</div><div className="profile-stat-label">Win rate</div></div>
      </div>
      <div className="profile-posts">
        <h2 className="profile-posts-title">{isOwn?'Your trades':`${profile.username}'s trades`}</h2>
        {posts.length===0?<div className="profile-empty">No trades posted yet.</div>
          :posts.map(post=><PostCard key={post.id} post={post} onUpvoteChange={load}/>)}
      </div>
    </div>
  )
}
