import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import CommentThread from './CommentThread'
import './PostCard.css'
function timeAgo(d){const s=(Date.now()-new Date(d))/1000;if(s<60)return'just now';if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`}
export default function PostCard({post,onUpvoteChange}){
  const {user}=useAuth()
  const [upvoted,setUpvoted]=useState(false)
  const [count,setCount]=useState(post.upvote_count??0)
  const [showComments,setShowComments]=useState(false)
  const [busy,setBusy]=useState(false)
  useEffect(()=>{
    if(!user)return
    supabase.from('upvotes').select('id').eq('post_id',post.id).eq('user_id',user.id).maybeSingle().then(({data})=>setUpvoted(!!data))
  },[post.id,user])
  async function handleUpvote(){
    if(!user||busy)return;setBusy(true)
    if(upvoted){await supabase.from('upvotes').delete().eq('post_id',post.id).eq('user_id',user.id);setUpvoted(false);setCount(c=>c-1)}
    else{await supabase.from('upvotes').insert({post_id:post.id,user_id:user.id});setUpvoted(true);setCount(c=>c+1)}
    setBusy(false);if(onUpvoteChange)onUpvoteChange()
  }
  const initials=post.username?.slice(0,2).toUpperCase()??'?'
  return(
    <article className="post-card">
      <div className="post-head">
        <div className="post-avatar">{initials}</div>
        <div className="post-meta">
          <div className="post-meta-top">
            <Link to={`/profile/${post.username}`} className="post-username">{post.username}</Link>
            <span className={`post-direction ${post.direction}`}>{post.direction==='long'?'↑ Long':'↓ Short'}</span>
            <span className={`post-instrument badge-${post.instrument}`}>{post.instrument}</span>
          </div>
          <div className="post-time">{timeAgo(post.created_at)}{post.session&&<span className="post-session"> · {post.session.replace('_',' ')}</span>}</div>
        </div>
      </div>
      <p className="post-body">{post.body}</p>
      {post.image_url&&<img className="post-chart-image" src={post.image_url} alt="Trade chart" loading="lazy"/>}
      {(post.entry||post.pnl||post.rr)&&(
        <div className="post-stats">
          {post.entry&&<div className="post-stat"><div className="post-stat-label">Entry</div><div className="post-stat-val">{Number(post.entry).toLocaleString()}</div></div>}
          {post.exit_price&&<div className="post-stat"><div className="post-stat-label">Exit</div><div className="post-stat-val">{Number(post.exit_price).toLocaleString()}</div></div>}
          {post.pnl!=null&&<div className="post-stat"><div className="post-stat-label">P&L</div><div className={`post-stat-val ${post.pnl>=0?'text-green':'text-red'}`}>{post.pnl>=0?'+':''} ${Number(post.pnl).toLocaleString()}</div></div>}
          {post.rr&&<div className="post-stat"><div className="post-stat-label">R:R</div><div className="post-stat-val">1:{post.rr}</div></div>}
        </div>
      )}
      <div className="post-actions">
        <button className={`action-btn${upvoted?' upvoted':''}`} onClick={handleUpvote} disabled={busy}>▲ <span>{count}</span></button>
        <button className="action-btn" onClick={()=>setShowComments(v=>!v)}>◎ {showComments?'Hide':'Comment'}</button>
        <button className="action-btn">◇ Save</button>
      </div>
      {showComments&&<CommentThread postId={post.id}/>}
    </article>
  )
}
