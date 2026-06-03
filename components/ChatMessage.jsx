'use client';

import ReactMarkdown from 'react-markdown';
import SourceCard from '@/components/SourceCard';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`message ${isUser ? 'message-user' : 'message-assistant'} ${
        message.error ? 'message-error' : ''
      }`}
    >
      <div className="message-avatar">
        <span>{isUser ? '👤' : '🏃'}</span>
      </div>
      <div>
        <div className="message-bubble">
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
        {message.sources && message.sources.length > 0 && (
          <SourceCard sources={message.sources} />
        )}
      </div>
    </div>
  );
}
