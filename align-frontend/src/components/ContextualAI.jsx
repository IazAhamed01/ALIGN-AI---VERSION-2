import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import './ContextualAI.css'

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')

function ContextualAI({ context, domain, language = 'en', mode = 'fab' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [autoInsights, setAutoInsights] = useState(null)
    const [loadingInsights, setLoadingInsights] = useState(true)

    // Remove the automatic useEffect to save quota
    // useEffect(() => { ... })

    const handleOpen = () => {
        setIsOpen(true)
        if (messages.length === 0) {
            generateAutoInsights()
        }
    }

    const generateAutoInsights = async () => {
        setLoadingInsights(true)
        try {
            const response = await fetch(`${API_URL}/api/ai-forecast/auto-insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: { ...context, domain } })
            })

            const data = await response.json()

            if (data.success) {
                setAutoInsights(data.data.insights)
                // Add as first message
                setMessages([{
                    type: 'ai',
                    text: data.data.insights,
                    timestamp: new Date()
                }])
            }
        } catch (error) {
            console.error('Auto-insights error:', error)
        } finally {
            setLoadingInsights(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        // Add user message
        const userMessage = { type: 'user', text: input, timestamp: new Date() }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/ai-forecast/contextual-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: input.trim(),
                    context: { ...context, domain },
                    language
                })
            })

            const data = await response.json()

            if (data.success) {
                const aiMessage = {
                    type: 'ai',
                    text: data.data.answer,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error('Failed to get response')
            }
        } catch (error) {
            console.error('Query error:', error)
            const errorMessage = {
                type: 'error',
                text: 'Sorry, I couldn\'t process your question. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const getDomainTitle = () => {
        const titles = {
            farmers: 'Farming Insights',
            storage: 'Storage Analysis',
            logistics: 'Logistics Report'
        }
        return titles[domain] || 'AI Analysis'
    }

    const getDomainColor = () => {
        const colors = {
            farmers: '#10b981',
            storage: '#f59e0b',
            logistics: '#3b82f6'
        }
        return colors[domain] || '#667eea'
    }

    const renderTrigger = () => {
        if (mode === 'button') {
            return (
                <button
                    className={`contextual-analysis-btn domain-${domain}`}
                    onClick={handleOpen}
                >
                    <Sparkles size={16} />
                    <span>Run AI Analysis</span>
                </button>
            )
        }

        return (
            <button
                className="contextual-ai-fab"
                onClick={handleOpen}
                style={{ background: getDomainColor() }}
                title="AI Assistant"
            >
                <Sparkles size={24} />
            </button>
        )
    }

    if (!isOpen) {
        return renderTrigger()
    }

    return (
        <>
            <div className={`contextual-ai-widget ${isMinimized ? 'minimized' : ''} domain-${domain}`}>
                {/* Header */}
                <div className="widget-header" style={{ background: getDomainColor() }}>
                    <div className="header-left">
                        <Sparkles size={20} />
                        <span>{getDomainTitle()}</span>
                    </div>
                    <div className="header-actions">
                        <button
                            className="header-btn"
                            onClick={() => setIsMinimized(!isMinimized)}
                            title={isMinimized ? 'Expand' : 'Minimize'}
                        >
                            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                            className="header-btn"
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="widget-messages">
                            {messages.length === 0 && loadingInsights && (
                                <div className="loading-insights">
                                    <Loader2 className="spinner" size={32} />
                                    <p>Analyzing your data...</p>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <div key={index} className={`message message-${message.type}`}>
                                    <div className="message-icon">
                                        {message.type === 'ai' ? (
                                            <Sparkles size={16} />
                                        ) : message.type === 'user' ? (
                                            <MessageCircle size={16} />
                                        ) : (
                                            <span>⚠️</span>
                                        )}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">{message.text}</div>
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="message message-ai">
                                    <div className="message-icon">
                                        <Loader2 className="spinner" size={16} />
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text typing">Thinking...</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form className="widget-input" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                style={{ background: getDomainColor() }}
                            >
                                {loading ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </>
    )
}

export default ContextualAI
