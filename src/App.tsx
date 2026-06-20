import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UrlDetector from './pages/UrlDetector'
import MessageAnalyzer from './pages/MessageAnalyzer'
import PdfAnalyzer from './pages/PdfAnalyzer'
import AdminPanel from './pages/AdminPanel'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/ChatBot'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan/url" element={<UrlDetector />} />
          <Route path="/scan/message" element={<MessageAnalyzer />} />
          <Route path="/scan/pdf" element={<PdfAnalyzer />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        </Route>
      </Routes>
      
      <ProtectedRoute>
        <ChatBot />
      </ProtectedRoute>
    </Router>
  )
}

export default App
