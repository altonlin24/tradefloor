import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import './CommentThread.css'
function timeAgo(d){const s=(Date.now()-new Date(d))/1000;if(s<60)return'just now';if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`}
export default function CommentThread({postId}){
  const {user,profile}=useAuth()
  const [comments,setComments]=useState([])
  const [body,setBody]=useState('')
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)
  useEffect(()=>{
    supabase.from('comments').select('*,users(username)').eq('post_id',postId).order('created_at',{ascending:true})
      .then(({data})=>{setComments(data??[]);setLoading(false)})
  },[postId])
  async function handleSubmit(e){
    e.preventDefault();if(!body.trim()||!user)return;setSubmitting(true)
    const {data,error}=await supabase.from('comments').insert({post_id:postId,user_id:user.id,body:body.trim()}).select('*,users(username)').single()
    if(!error){setComments(p=>[...p,data]);setBody('')}
    setSubmitting(false)
  }
  const initials=profile?.username?.slice(0,2).toUpperCase()??'?'
  return(
    <div className="comments">
      {loading?<div className="comments-loading">Loading...</div>
        :comments.length===0?<div className="comments-empty">No comments yet.</div>
        :comments.map(c=>(
          <div key={c.id} className="comment">
            <div className="comment-avatar">{c.users?.username?.slice(0,2).toUpperCase()??'?'}</div>
            <div className="comment-body">
              <span className="comment-username">{c.users?.username}</span>
              <span className="comment-time"> · {timeAgo(c.created_at)}</span>
              <p className="comment-text">{c.body}</p>
            </div>
          </div>
        ))}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-avatar comment-avatar-sm">{initials}</div>
        <input className="comment-input" placeholder="Add a comment..." value={body} onChange={e=>setBody(e.target.value)} maxLength={500}/>
        <button className="comment-submit" type="submit" disabled={!body.trim()||submitting}>{submitting?'...':'Post'}</button>
      </form>
    </div>
  )
}
