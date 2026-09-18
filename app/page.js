'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/ChatMessage';

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

  // Fix iOS viewport height when virtual keyboard is shown
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

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Blur input on mobile to dismiss keyboard after send
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
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
        throw new Error(data.error || 'Something went wrong while retrieving guidelines.');
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
        content: `**Notice:** ${err.message}. Please check your connection and retry.`,
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      if (window.confirm('Start a new inquiry session? Current conversation will be cleared.')) {
        setMessages([]);
        setInput('');
      }
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="app">
      {/* ── Ambient Kinetic Background Layer ───────────────── */}
      <div className="ambient-bg-layer" aria-hidden="true">
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />
        <div className="ambient-grid-matrix" />
        <div className="ambient-wave-wrap">
          <svg className="ambient-wave-svg" viewBox="0 0 1440 260" preserveAspectRatio="none">
            <path
              className="ambient-wave-line-1"
              d="M0,130 C200,80 360,180 580,130 C780,80 940,190 1140,130 C1280,90 1380,160 1440,130"
              fill="none"
              stroke="url(#ambient-grad-1)"
              strokeWidth="2"
            />
            <path
              className="ambient-wave-line-2"
              d="M0,150 C220,190 400,100 620,150 C820,190 980,100 1200,150 C1320,180 1400,120 1440,150"
              fill="none"
              stroke="url(#ambient-grad-2)"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="ambient-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                <stop offset="25%" stopColor="#2563eb" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#059669" stopOpacity="0.35" />
                <stop offset="80%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ambient-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0" />
                <stop offset="30%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-wrap" role="banner">
              <div className="logo-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-title">ActiveGuide</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            {hasMessages && (
              <button
                type="button"
                className="header-btn-secondary btn-new-chat"
                onClick={handleClearChat}
                title="Start a new session"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span className="btn-label-desktop">New Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Work Area ───────────────────────────────────── */}
      <main className="main">
        {!hasMessages ? (
          /* ── Welcome / Guideline Knowledge Overview ─────────── */
          <div className="welcome">
            <div className="welcome-content">
              <h1 className="welcome-title">
                Physical Activity Guidelines Assistant
              </h1>

              {/* Benchmark Reference Grid */}
              <div className="benchmarks-bar">
                <div className="benchmark-card benchmark-card-blue">
                  <div className="benchmark-value">150–300 min/wk</div>
                  <div className="benchmark-label">Adult aerobic target</div>
                </div>
                <div className="benchmark-card benchmark-card-indigo">
                  <div className="benchmark-value">2+ days/wk</div>
                  <div className="benchmark-label">Muscle strengthening</div>
                </div>
                <div className="benchmark-card benchmark-card-emerald">
                  <div className="benchmark-value">60+ min/day</div>
                  <div className="benchmark-label">Youth & adolescents</div>
                </div>
                <div className="benchmark-card benchmark-card-amber">
                  <div className="benchmark-value">Cumulative</div>
                  <div className="benchmark-label">Every minute counts</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Structured Message Stream ──────────────────────── */
          <div className="chat-container" ref={messagesContainerRef}>
            <div className="messages">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}

              {loading && (
                <div className="message message-assistant message-loading">
                  <div className="message-avatar" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="message-body-wrap">
                    <div className="message-header-row">
                      <span className="message-sender-name">ActiveGuide Evidence</span>
                    </div>
                    <div className="message-bubble">
                      <div className="loading-state">
                        <div className="loading-pulse-spinner" />
                        <span className="loading-text">
                          Retrieving relevant guideline passages & citations...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* ── Input Dock ───────────────────────────────────────── */}
      <footer className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <textarea
              ref={inputRef}
              className="input-field"
              placeholder="Ask about physical activity guidelines, dosages, age groups, or chronic conditions..."
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
              title="Submit query"
              aria-label="Submit query"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
