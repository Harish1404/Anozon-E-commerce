import { useEffect, useRef, useState } from 'react'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '../services/ai'

const AiChatbot = () => {
    const { isAuth } = useAuth()
    const navigate = useNavigate()

    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m Anozon AI. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!isAuth) {
            alert("Please login to access the AI Chatbot");
            navigate("/login")
        }
    }, [])

    useEffect(()=>{
        document.title = 'Anozon | AI'
    },[])

    const sendMessage = async () => {

        const trimmed = input.trim()

        if (!trimmed || loading) 
            return

        setMessages(prev => [...prev, { role: 'user', text: trimmed }])

        setInput('')
        setLoading(true)

        try {
            const reply = await getAIResponse(trimmed)
            setMessages(prev => [...prev, { role: 'bot', text: reply }])
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl flex flex-col h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">

                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AI</div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Anozon AI Assistant</p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                        </p>
                    </div>
                </div>

                
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                            </div>
                        </div>
                    )}
            
                </div>

            
                <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-700 flex gap-3 items-end">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.03]"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AiChatbot
