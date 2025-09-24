import React, { useState } from 'react';
import { aiService } from '../services/aiService';

const SimpleChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ id: number, text: string, sender: 'user' | 'bot' }>>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Default message suggestions
    const defaultSuggestions = [
        "How can I donate to causes in Bangladesh?",
        "I want to volunteer for community projects",
        "How do NGOs register on this platform?",
        "What types of help are available?",
        "Tell me about Jonoshongjog platform"
    ];

    const sendMessageWithText = async (messageText: string) => {
        if (!messageText.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user' as const
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Use real AI agent
            const response = await aiService.processMessage({
                message: messageText,
                context: {
                    userRole: 'guest',
                    language: 'en',
                    conversationHistory: messages.slice(-5).map(msg => ({
                        text: msg.text,
                        sender: msg.sender,
                        timestamp: new Date(),
                        id: msg.id
                    }))
                },
                sessionId: sessionId,
                userId: undefined
            });

            const botMessage = {
                id: Date.now() + 1,
                text: response.data?.message || 'Sorry, I could not process your request. Please try again.',
                sender: 'bot' as const
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, something went wrong. Please try again later.',
                sender: 'bot' as const
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const sendMessage = () => sendMessageWithText(inputText);

    // Floating button when closed
    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    color: 'white',
                    fontSize: '24px'
                }}
            >
                💬
            </div>
        );
    }

    // Chat interface when open
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '350px',
                height: '450px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div>
                    <div style={{ fontWeight: 'bold' }}>AI Assistant</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Online</div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}
            >
                {messages.length === 0 && (
                    <div>
                        <div style={{ color: '#6b7280', textAlign: 'center', marginBottom: '16px' }}>
                            Hello! How can I help you today?
                        </div>

                        {/* Default message suggestions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ color: '#374151', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                                Quick Questions:
                            </div>
                            {defaultSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessageWithText(suggestion)}
                                    disabled={isTyping}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        color: '#374151',
                                        fontSize: '13px',
                                        cursor: isTyping ? 'not-allowed' : 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        opacity: isTyping ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isTyping) {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            e.currentTarget.style.borderColor = '#10B981';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isTyping) {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: message.sender === 'user' ? '#10B981' : '#f3f4f6',
                            color: message.sender === 'user' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            maxWidth: '80%'
                        }}
                    >
                        {message.text}
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div
                        style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#f3f4f6',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            maxWidth: '80%'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <div>AI is typing</div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <div style={{ width: '4px', height: '4px', backgroundColor: '#6b7280', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                <div style={{ width: '4px', height: '4px', backgroundColor: '#6b7280', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.5s' }}></div>
                                <div style={{ width: '4px', height: '4px', backgroundColor: '#6b7280', borderRadius: '50%', animation: 'pulse 1.5s infinite 1s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div
                style={{
                    padding: '16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '8px'
                }}
            >
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isTyping) {
                            sendMessage();
                        }
                    }}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        outline: 'none',
                        opacity: isTyping ? 0.7 : 1
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: (inputText.trim() && !isTyping) ? '#10B981' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (inputText.trim() && !isTyping) ? 'pointer' : 'not-allowed'
                    }}
                >
                    {isTyping ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default SimpleChatbot;