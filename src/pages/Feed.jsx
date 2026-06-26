import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PostCard from '../components/feed/PostCard'
import PostComposer from '../components/feed/PostComposer'
import RightPanel from '../components/feed/RightPanel'
import './Feed.css'
const FILTERS = ['All','NQ','ES','GC','SI']
export default function Feed() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchPosts()
    const channel = supabase.channel('posts-feed')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'posts'},()=>fetchPosts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [filter])
  async function fetchPosts() {
    setLoading(true)
    let q = supabase.from('posts_feed').select('*').order('created_at',{ascending:false}).limit(50)
    if (filter !== 'All') q = q.eq('instrument', filter)
    const { data, error } = await q
    if (!error) setPosts(data ?? [])
    setLoading(false)
  }
  return (
    <div className="feed-layout">
      <div className="feed-center">
        <div className="feed-header">
          <h1 className="feed-title">{filter==='All'?'All markets':`${filter} feed`}</h1>
          <div className="feed-filters">
            {FILTERS.map(f=><button key={f} className={filter===f?'feed-filter active':'feed-filter'} onClick={()=>setFilter(f)}>{f}</button>)}
          </div>
        </div>
        <PostComposer onPost={post=>setPosts(prev=>[post,...prev])} />
        {loading ? <div className="feed-loading">Loading trades...</div>
          : posts.length===0 ? <div className="feed-empty">No trades posted yet. Be the first.</div>
          : posts.map(post=><PostCard key={post.id} post={post} onUpvoteChange={fetchPosts}/>)}
      </div>
      <RightPanel />
    </div>
  )
}
