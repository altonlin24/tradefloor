import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import './index.css'
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading...</div>
  if (!session) return <Navigate to="/auth" replace />
  return children
}
function AppShell() {
  const { session } = useAuth()
  if (!session) return <Routes><Route path="/auth" element={<Auth />} /><Route path="*" element={<Navigate to="/auth" replace />} /></Routes>
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
export default function App() {
  return <AuthProvider><BrowserRouter><AppShell /></BrowserRouter></AuthProvider>
}
