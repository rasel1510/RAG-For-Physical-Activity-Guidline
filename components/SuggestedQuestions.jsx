'use client';

import { useState } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Core Topics' },
  { id: 'adults', label: 'Adults (18–64)' },
  { id: 'seniors', label: 'Older Adults (65+)' },
  { id: 'youth', label: 'Children & Adolescents' },
  { id: 'special', label: 'Pregnancy & Health Conditions' },
];

const SUGGESTIONS = [
  {
    category: 'adults',
    tag: 'Aerobic & Strength',
    badge: '150–300 min/wk',
    title: 'Weekly activity dosage for adults',
    text: 'What are the recommended weekly aerobic and muscle-strengthening targets for adults aged 18 to 64?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    category: 'seniors',
    tag: 'Multicomponent & Balance',
    badge: 'Fall Prevention',
    title: 'Functional training for older adults',
    text: 'What multicomponent physical activities and balance training are recommended for older adults to prevent falls?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
      </svg>
    ),
  },
  {
    category: 'youth',
    tag: 'Pediatric Health',
    badge: '60+ min/day',
    title: 'Youth & adolescent developmental targets',
    text: 'What are the daily aerobic, muscle-strengthening, and bone-strengthening requirements for children and adolescents?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    category: 'special',
    tag: 'Maternal Health',
    badge: 'Clinical Safety',
    title: 'Physical activity during pregnancy & postpartum',
    text: 'What are the safe activity limits and evidence-based benefits during pregnancy and the postpartum period?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    category: 'special',
    tag: 'Chronic Disease',
    badge: 'Risk Reduction',
    title: 'Guidance for chronic conditions & disability',
    text: 'How should individuals with chronic health conditions (hypertension, type 2 diabetes, osteoarthritis) adapt guidelines safely?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    category: 'adults',
    tag: 'Intensity Metrics',
    badge: 'METs & Target Heart Rate',
    title: 'Differentiating moderate vs. vigorous intensity',
    text: 'How do the guidelines scientifically distinguish between moderate-intensity and vigorous-intensity aerobic activities?',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function SuggestedQuestions({ onSelect }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredSuggestions =
    activeTab === 'all'
      ? SUGGESTIONS
      : SUGGESTIONS.filter((s) => s.category === activeTab);

  return (
    <div className="suggestions-section">
      {/* Category Filter Pills */}
      <div className="category-pills-wrapper" role="tablist" aria-label="Topic Categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeTab === cat.id}
            className={`category-pill ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="suggestions-grid">
        {filteredSuggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            className="suggestion-card"
            onClick={() => onSelect(s.text)}
          >
            <div className="suggestion-card-header">
              <span className="suggestion-icon-wrap">{s.icon}</span>
              <div className="suggestion-meta">
                <span className="suggestion-tag">{s.tag}</span>
                <span className="suggestion-badge">{s.badge}</span>
              </div>
            </div>
            <div className="suggestion-title">{s.title}</div>
            <p className="suggestion-text">{s.text}</p>
            <div className="suggestion-cta">
              <span>Query Guideline</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
