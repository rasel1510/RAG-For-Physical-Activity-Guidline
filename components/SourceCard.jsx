'use client';

import { useState } from 'react';

export default function SourceCard({ sources }) {
  const [showSources, setShowSources] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpanded = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <div className="sources-container">
      <button
        className="sources-toggle"
        onClick={() => setShowSources(!showSources)}
      >
        <span>📎 {sources.length} sources</span>
        <span
          className={`sources-toggle-icon ${showSources ? 'expanded' : ''}`}
        >
          ▼
        </span>
      </button>

      {showSources && (
        <div className="sources-list">
          {sources.map((source, i) => (
            <div key={i} className="source-card">
              <div className="source-header" onClick={() => toggleExpanded(i)}>
                <div className="source-meta">
                  <span className="source-page-badge">Page {source.page}</span>
                  <span className="source-name" title={source.source}>
                    {source.source.replace('.pdf', '')}
                  </span>
                </div>
                <span className="source-score">
                  {Math.round(source.score * 100)}% match
                </span>
                <span
                  className={`source-expand-icon ${
                    expandedIndex === i ? 'expanded' : ''
                  }`}
                >
                  ▼
                </span>
              </div>
              {expandedIndex === i && (
                <div className="source-content">
                  <p>
                    {source.chunk.length > 400
                      ? source.chunk.slice(0, 400) + '…'
                      : source.chunk}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
