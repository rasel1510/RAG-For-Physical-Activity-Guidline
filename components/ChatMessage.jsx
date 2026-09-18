'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import SourceCard from '@/components/SourceCard';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  return (
    <div
      className={`message ${isUser ? 'message-user' : 'message-assistant'} ${
        message.error ? 'message-error' : ''
      }`}
    >
      <div className="message-avatar" aria-hidden="true">
        {isUser ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        )}
      </div>

      <div className="message-body-wrap">
        <div className="message-header-row">
          <span className="message-sender-name">
            {isUser ? 'Inquiry' : 'ActiveGuide Evidence'}
          </span>
          {!isUser && !message.error && (
            <div className="message-actions">
              <button
                type="button"
                className="action-copy-btn"
                onClick={handleCopy}
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="message-bubble">
          {isUser ? (
            <div className="user-message-text">{message.content}</div>
          ) : (
            <div className="markdown-prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <SourceCard sources={message.sources} />
        )}
      </div>
    </div>
  );
}
