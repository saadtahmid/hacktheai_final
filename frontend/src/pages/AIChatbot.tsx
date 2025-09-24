import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';
import { aiService } from '../services/aiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIChatbot: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with greeting message
    const greetingMessage: Message = {
      id: 1,
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! আমি জনসংযোগের AI সহায়ক। আপনি কিভাবে সাহায্য করতে পারি?'
        : 'Hello! I am Jonoshongjog AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  }, [language]); useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Use real AI agent from aiService
      const response = await aiService.processMessage({
        message: text,
        context: {
          userRole: 'guest',
          language: language,
          conversationHistory: messages.slice(-5).map(msg => ({
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
            id: msg.id
          }))
        },
        sessionId: sessionId,
        userId: undefined
      });

      const botMessage: Message = {
        id: messages.length + 2,
        text: response.data?.message || 'Sorry, I could not process your request. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI chat error:', error);

      // Fallback response
      const fallbackMessage: Message = {
        id: messages.length + 2,
        text: language === 'bn'
          ? 'দুঃখিত, কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }; const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen"
      style={{ minHeight: '100vh', background: colors.bg.gradient }}>

      {/* Header */}
      <header className="shadow-lg border-b-2"
        style={{ backgroundColor: colors.bg.primary, boxShadow: colors.shadow, borderBottom: `2px solid ${colors.border.accent}` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem' }}>
          <div className="flex justify-between items-center"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => window.history.back()}
                className="text-green-600 hover:text-green-700"
                style={{ color: colors.text.secondary, background: 'none', border: `1px solid ${colors.border.primary}`, cursor: 'pointer', transition: 'color 0.3s ease', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: colors.bg.secondary }}
              >
                <svg className="w-6 h-6" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                  style={{ width: '2.5rem', height: '2.5rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-6 h-6 text-green-600" style={{ width: '1.5rem', height: '1.5rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 bangla-text"
                    style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.text.primary }}>
                    {language === 'bn' ? 'AI সহায়ক' : 'AI Assistant'}
                  </h1>
                  <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                    {language === 'bn' ? 'সর্বদা সাহায্যের জন্য প্রস্তুত' : 'Always ready to help'}
                  </p>
                </div>
              </div>
            </div>
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem' }}>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, overflow: 'hidden' }}>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4"
            style={{ height: '24rem', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {messages.map((message) => (
              <div key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>

                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{
                    maxWidth: message.sender === 'user' ? '20rem' : '24rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: message.sender === 'user' ? colors.green.primary : colors.bg.secondary,
                    color: message.sender === 'user' ? 'white' : colors.text.primary
                  }}>

                  <div className="flex items-start space-x-2" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div className="flex-1">
                      <p className="text-sm bangla-text leading-relaxed"
                        style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                        {message.text}
                      </p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}
                        style={{
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          color: message.sender === 'user' ? '#bbf7d0' : colors.text.tertiary
                        }}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl max-w-xs"
                  style={{ backgroundColor: colors.bg.secondary, padding: '0.75rem 1rem', borderRadius: '1rem', maxWidth: '20rem' }}>
                  <div className="flex items-center space-x-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="flex space-x-1" style={{ display: 'flex', gap: '0.25rem' }}>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.text.tertiary, borderRadius: '50%', animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.text.tertiary, borderRadius: '50%', animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.text.tertiary, borderRadius: '50%', animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500" style={{ fontSize: '0.75rem', color: colors.text.tertiary }}>
                      {language === 'bn' ? 'টাইপ করছি...' : 'Typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4"
            style={{ borderTop: `1px solid ${colors.border.primary}`, padding: '1rem' }}>

            {/* Quick Actions */}
            <div className="mb-4 flex flex-wrap gap-2" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                { key: 'donate', text: { bn: 'দান করতে চাই', en: 'I want to donate' } },
                { key: 'request', text: { bn: 'সাহায্য চাই', en: 'Need help' } },
                { key: 'volunteer', text: { bn: 'স্বেচ্ছাসেবক হতে চাই', en: 'Want to volunteer' } },
                { key: 'status', text: { bn: 'অবস্থা জানতে চাই', en: 'Check status' } }
              ].map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleSendMessage(action.text[language])}
                  className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    backgroundColor: colors.green.bg,
                    color: colors.green.primary,
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.green.border}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  {action.text[language]}
                </button>
              ))}
            </div>

            {/* Input Controls */}
            <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* Text Input */}
              <div className="flex-1" style={{ flex: '1 1 0%', minWidth: 0 }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Type your message...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bangla-text"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '0.75rem',
                    outline: 'none',
                    fontSize: '0.875rem',
                    backgroundColor: colors.bg.secondary,
                    color: colors.text.primary
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                style={{
                  padding: '0.75rem',
                  backgroundColor: inputText.trim() ? colors.green.primary : colors.bg.primary,
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  minWidth: '3rem',
                  minHeight: '3rem'
                }}
              >
                <svg className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>


          </div>
        </div>

        {/* Help Panel */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6"
          style={{ marginTop: '1.5rem', backgroundColor: colors.bg.tertiary, borderRadius: '0.75rem', boxShadow: colors.shadow, padding: '1.5rem' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-4 bangla-text"
            style={{ fontSize: '1.125rem', fontWeight: '700', color: colors.text.primary, marginBottom: '1rem' }}>
            {language === 'bn' ? 'আমি কিভাবে সাহায্য করতে পারি' : 'How I Can Help'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>

            <div className="flex items-start space-x-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: '2rem', height: '2rem', backgroundColor: colors.green.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="w-4 h-4 text-green-600" style={{ width: '1rem', height: '1rem', color: colors.green.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 bangla-text" style={{ fontWeight: '600', color: colors.text.primary }}>
                  {language === 'bn' ? 'দান করুন' : 'Make Donations'}
                </h4>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? 'খাবার, কাপড়, ওষুধ দান করার প্রক্রিয়া' : 'Process for donating food, clothes, medicine'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: '2rem', height: '2rem', backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="w-4 h-4 text-blue-600" style={{ width: '1rem', height: '1rem', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 bangla-text" style={{ fontWeight: '600', color: colors.text.primary }}>
                  {language === 'bn' ? 'সাহায্য পান' : 'Get Help'}
                </h4>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? 'জরুরি ত্রাণ সামগ্রীর জন্য অনুরোধ' : 'Request emergency relief supplies'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: '2rem', height: '2rem', backgroundColor: isDark ? '#581c87' : '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="w-4 h-4 text-purple-600" style={{ width: '1rem', height: '1rem', color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 bangla-text" style={{ fontWeight: '600', color: colors.text.primary }}>
                  {language === 'bn' ? 'স্বেচ্ছাসেবক' : 'Volunteer'}
                </h4>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? 'ডেলিভারি ও পিকআপে সাহায্য করুন' : 'Help with delivery and pickup services'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: '2rem', height: '2rem', backgroundColor: isDark ? '#92400e' : '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg className="w-4 h-4 text-yellow-600" style={{ width: '1rem', height: '1rem', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 bangla-text" style={{ fontWeight: '600', color: colors.text.primary }}>
                  {language === 'bn' ? 'অবস্থা জানুন' : 'Track Status'}
                </h4>
                <p className="text-sm text-gray-600 bangla-text" style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                  {language === 'bn' ? 'আপনার দান ও অনুরোধের অবস্থা দেখুন' : 'Check status of your donations and requests'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;