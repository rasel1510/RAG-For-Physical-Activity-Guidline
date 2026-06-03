'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import SuggestedQuestions from '@/components/SuggestedQuestions';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const text = (question || input).trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

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
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
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
              <div className="welcome-badge">AI-Powered Knowledge Base</div>
              <h1 className="welcome-title">
                Your Expert Guide to{' '}
                <span className="gradient-text">Physical Activity</span>
              </h1>
              <p className="welcome-description">
                Ask any question about the Physical Activity Guidelines for
                Americans. Get evidence-based answers with page citations from
                the official guidelines.
              </p>
              <SuggestedQuestions onSelect={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          /* ── Chat Interface ────────────────────────────── */
          <div className="chat-container">
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
            <input
              ref={inputRef}
              type="text"
              className="input-field"
              placeholder="Ask about physical activity guidelines…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || loading}
              title="Send message"
            >
              ➤
            </button>
          </div>
          <p className="input-hint">
            Powered by RAG — Retrieves relevant guideline sections before
            generating answers
          </p>
        </form>
      </div>
    </div>
  );
}
