import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import './PostComposer.css'
const INSTRUMENTS=['NQ','ES','GC','SI']
const SESSIONS=['asia','london','new_york','pre_market','after_hours']
export default function PostComposer({onPost}){
  const {user,profile}=useAuth()
  const [body,setBody]=useState('')
  const [instrument,setInstrument]=useState('GC')
  const [direction,setDirection]=useState('long')
  const [session,setSession]=useState('')
  const [entry,setEntry]=useState('')
  const [exitPrice,setExitPrice]=useState('')
  const [pnl,setPnl]=useState('')
  const [rr,setRr]=useState('')
  const [imageFile,setImageFile]=useState(null)
  const [imagePreview,setImagePreview]=useState(null)
  const [showStats,setShowStats]=useState(false)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const fileRef=useRef()
  const initials=profile?.username?.slice(0,2).toUpperCase()??'?'
  function handleImageChange(e){const f=e.target.files[0];if(!f)return;setImageFile(f);setImagePreview(URL.createObjectURL(f))}
  async function handleSubmit(){
    if(!body.trim()||!user)return;setLoading(true);setError(null)
    try{
      let imageUrl=null
      if(imageFile){
        const ext=imageFile.name.split('.').pop()
        const path=`${user.id}/${Date.now()}.${ext}`
        const {error:ue}=await supabase.storage.from('chart-images').upload(path,imageFile)
        if(ue)throw ue
        imageUrl=supabase.storage.from('chart-images').getPublicUrl(path).data.publicUrl
      }
      const payload={user_id:user.id,body:body.trim(),instrument,direction,session:session||null,
        entry:entry?parseFloat(entry):null,exit_price:exitPrice?parseFloat(exitPrice):null,
        pnl:pnl?parseFloat(pnl):null,rr:rr?parseFloat(rr):null,image_url:imageUrl}
      const {data,error:ie}=await supabase.from('posts').insert(payload).select().single()
      if(ie)throw ie
      if(onPost)onPost({...data,username:profile.username,upvote_count:0})
      setBody('');setEntry('');setExitPrice('');setPnl('');setRr('');setSession('')
      setImageFile(null);setImagePreview(null);setShowStats(false)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
  }
  return(
    <div className="composer">
      <div className="composer-top">
        <div className="composer-avatar">{initials}</div>
        <textarea className="composer-textarea" placeholder="Post a trade... entry, setup, what you saw." value={body} onChange={e=>setBody(e.target.value)} rows={3} maxLength={1000}/>
      </div>
      {imagePreview&&<div className="composer-preview"><img src={imagePreview} alt="preview"/><button className="composer-remove-img" onClick={()=>{setImageFile(null);setImagePreview(null)}}>✕</button></div>}
      {showStats&&(
        <div className="composer-stats">
          <div className="composer-stat-field"><label>Session</label><select value={session} onChange={e=>setSession(e.target.value)}><option value="">— optional —</option>{SESSIONS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></div>
          <div className="composer-stat-field"><label>Entry</label><input type="number" placeholder="0.00" value={entry} onChange={e=>setEntry(e.target.value)}/></div>
          <div className="composer-stat-field"><label>Exit</label><input type="number" placeholder="0.00" value={exitPrice} onChange={e=>setExitPrice(e.target.value)}/></div>
          <div className="composer-stat-field"><label>P&L ($)</label><input type="number" placeholder="0" value={pnl} onChange={e=>setPnl(e.target.value)}/></div>
          <div className="composer-stat-field"><label>R:R</label><input type="number" placeholder="2.0" step="0.1" value={rr} onChange={e=>setRr(e.target.value)}/></div>
        </div>
      )}
      <div className="composer-bottom">
        <div className="composer-controls">
          <div className="composer-instrument-group">
            {INSTRUMENTS.map(i=><button key={i} className={`composer-inst${instrument===i?` active badge-${i}`:''}`} onClick={()=>setInstrument(i)}>{i}</button>)}
          </div>
          <div className="composer-dir-group">
            <button className={`composer-dir${direction==='long'?' active-long':''}`} onClick={()=>setDirection('long')}>↑ Long</button>
            <button className={`composer-dir${direction==='short'?' active-short':''}`} onClick={()=>setDirection('short')}>↓ Short</button>
          </div>
          <button className="composer-tool" onClick={()=>fileRef.current.click()} title="Add chart image">📷</button>
          <button className={`composer-tool${showStats?' active':''}`} onClick={()=>setShowStats(v=>!v)} title="Add stats">📊</button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange}/>
        </div>
        <div className="composer-right">
          {error&&<span className="composer-error">{error}</span>}
          <span className="composer-char">{body.length}/1000</span>
          <button className="composer-submit" onClick={handleSubmit} disabled={!body.trim()||loading}>{loading?'Posting...':'Post trade'}</button>
        </div>
      </div>
    </div>
  )
}
