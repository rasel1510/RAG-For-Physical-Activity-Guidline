'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/ChatMessage';
import SuggestedQuestions from '@/components/SuggestedQuestions';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Fix iOS viewport height when keyboard is shown
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const sendMessage = async (question) => {
    const text = (question || input).trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Blur input on mobile to dismiss keyboard after send
    if (window.innerWidth < 768) {
      inputRef.current?.blur();
    }

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ **Error:** ${err.message}. Please try again.`,
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      // On desktop, refocus input; on mobile let user tap
      if (window.innerWidth >= 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // Handle Enter key in textarea (send on Enter, newline on Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🏃</div>
            <div>
              <div className="logo-title">ActiveGuide AI</div>
              <div className="logo-subtitle">
                Physical Activity Guidelines Assistant
              </div>
            </div>
          </div>
          <div className="header-badge">● RAG Powered</div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="main">
        {!hasMessages ? (
          /* ── Welcome Screen ────────────────────────────── */
          <div className="welcome">
            <div className="welcome-content">
              <h1 className="welcome-title">
                Your Expert Guide to{' '}
                <span className="gradient-text">Physical Activity</span>
              </h1>
              <SuggestedQuestions onSelect={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          /* ── Chat Interface ────────────────────────────── */
          <div className="chat-container" ref={messagesContainerRef}>
            <div className="messages">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}

              {loading && (
                <div className="message message-assistant">
                  <div className="message-avatar">
                    <span>🏃</span>
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <textarea
              ref={inputRef}
              className="input-field"
              placeholder="Ask about physical activity guidelines…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || loading}
              title="Send message"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="input-hint">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
