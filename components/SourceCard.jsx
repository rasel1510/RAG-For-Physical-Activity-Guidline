'use client';

import { useState } from 'react';

export default function SourceCard({ sources }) {
  const [showSources, setShowSources] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!sources || sources.length === 0) return null;

  const toggleExpanded = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <div className="sources-container">
      <button
        type="button"
        className={`sources-toggle ${showSources ? 'active' : ''}`}
        onClick={() => setShowSources(!showSources)}
        aria-expanded={showSources}
      >
        <span className="sources-toggle-left">
          <svg
            className="sources-book-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="sources-toggle-label">
            <strong>{sources.length} Verified Evidence Sources</strong>
          </span>
        </span>
        <span className="sources-toggle-right">
          <span className="sources-badge-pages">
            Pages {sources.map((s) => s.page).slice(0, 3).join(', ')}
            {sources.length > 3 ? '...' : ''}
          </span>
          <svg
            className={`sources-arrow-icon ${showSources ? 'rotated' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {showSources && (
        <div className="sources-list">
          <div className="sources-header-hint">
            Direct excerpts from the Physical Activity Guidelines for Americans (2nd Edition):
          </div>
          {sources.map((source, i) => {
            const isExpanded = expandedIndex === i;
            const matchPercent = Math.round(source.score * 100);
            return (
              <div
                key={i}
                className={`source-card ${isExpanded ? 'source-card-expanded' : ''}`}
              >
                <div
                  className="source-header"
                  onClick={() => toggleExpanded(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleExpanded(i);
                  }}
                >
                  <div className="source-meta">
                    <span className="source-page-badge">Page {source.page}</span>
                    <span className="source-name" title={source.source}>
                      {source.source.replace('.pdf', '')}
                    </span>
                  </div>
                  <div className="source-metrics">
                    <span className="source-score" title="Vector similarity score">
                      {matchPercent}% relevance
                    </span>
                    <span
                      className={`source-expand-icon ${
                        isExpanded ? 'expanded' : ''
                      }`}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="source-content">
                    <blockquote className="source-quote">
                      <p>{source.chunk}</p>
                    </blockquote>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
