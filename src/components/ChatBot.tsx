import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, ShieldCheck } from 'lucide-react'
import { groqStream, type ChatMessage, CHATBOT_SYSTEM_PROMPT } from '../services/groq'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: "Hi! I'm SafeHire AI's security advisor. Ask me anything about job scams, how to spot them, or questions about your scan results." }])
    }
  }, [isOpen])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const apiMessages = [
        { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
        ...newMessages.slice(-10) // Keep last 10 messages for context
      ]

      await groqStream(
        apiMessages as any,
        (chunk) => {
          setMessages(prev => {
            const last = { ...prev[prev.length - 1] }
            last.content += chunk
            return [...prev.slice(0, -1), last]
          })
        },
        () => setLoading(false)
      )
    } catch (err: any) {
      setMessages(prev => {
        const last = { ...prev[prev.length - 1] }
        last.content = `Error: ${err.message}. Please try again.`
        return [...prev.slice(0, -1), last]
      })
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-glow-brand transition-all duration-300 z-40 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
        }`}
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-3rem)] glass-card flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{ background: '#0a0a0f', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(99,102,241,0.05)] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">SafeHire Advisor</h3>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-2 max-w-[90%]">
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center border border-indigo-500/30">
                    <Bot className="w-3 h-3 text-indigo-400" />
                  </div>
                )}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.content || (loading && i === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about job safety..."
            className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  )
}
