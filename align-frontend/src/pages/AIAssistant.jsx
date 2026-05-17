import { useState } from 'react'
import { Send, Sparkles, Loader2, MessageCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import './AIAssistant.css'

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')

function AIAssistant() {
    const { language } = useLanguage()
    const [question, setQuestion] = useState('')
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: 'Hello! I\'m your intelligent assistant for Agriculture, Storage, and Logistics. Ask me anything about farming practices, crop management, storage optimization, inventory management, logistics planning, or supply chain efficiency!'
        }
    ])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!question.trim() || loading) return

        // Add user message
        const userMessage = { type: 'user', text: question }
        setMessages(prev => [...prev, userMessage])
        setQuestion('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/ai-forecast/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.trim(),
                    language: language
                })
            })

            const data = await response.json()

            if (data.success && data.data) {
                const aiMessage = {
                    type: 'ai',
                    text: data.data.answer,
                    timestamp: new Date(data.data.generated_at)
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error('Failed to get AI response')
            }
        } catch (error) {
            console.error('AI Query Error:', error)
            const errorMessage = {
                type: 'error',
                text: 'Sorry, I couldn\'t process your question. Please try again or check if the backend is running.'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const quickQuestions = [
        'What are the best practices for harvest timing?',
        'How can I optimize storage capacity?',
        'What factors affect logistics planning?',
        'How to reduce transportation costs?'
    ]

    const handleQuickQuestion = (q) => {
        setQuestion(q)
    }

    return (
        <div className="ai-assistant-page">
            <div className="ai-assistant-container">
                {/* Header */}
                <div className="ai-header">
                    <div className="ai-header-content">
                        <div className="ai-icon-wrapper">
                            <Sparkles className="ai-icon" size={32} />
                        </div>
                        <div>
                            <h1>AI Assistant</h1>
                            <p>Answers to all your queries</p>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="chat-container">
                    {/* Messages */}
                    <div className="messages-area">
                        {messages.map((message, index) => (
                            <div key={index} className={`message message-${message.type}`}>
                                <div className="message-icon">
                                    {message.type === 'ai' ? (
                                        <Sparkles size={20} />
                                    ) : message.type === 'user' ? (
                                        <MessageCircle size={20} />
                                    ) : (
                                        <span>⚠️</span>
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    {message.timestamp && (
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="message message-ai">
                                <div className="message-icon">
                                    <Loader2 className="spinner" size={20} />
                                </div>
                                <div className="message-content">
                                    <div className="message-text typing-indicator">
                                        AI is thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className="quick-questions">
                            <p className="quick-questions-title">Quick Questions:</p>
                            <div className="quick-questions-grid">
                                {quickQuestions.map((q, index) => (
                                    <button
                                        key={index}
                                        className="quick-question-btn"
                                        onClick={() => handleQuickQuestion(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Form */}
                    <form className="chat-input-form" onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask me anything about agriculture..."
                                className="chat-input"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="send-button"
                                disabled={!question.trim() || loading}
                            >
                                {loading ? (
                                    <Loader2 className="spinner" size={20} />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Footer */}
                <div className="ai-info">
                    <p>💡 Tip: Ask specific questions for better answers. Example: "What's the optimal moisture level for wheat harvest?"</p>
                </div>
            </div>
        </div>
    )
}

export default AIAssistant
