'use client';

const SUGGESTIONS = [
  {
    icon: '🏋️',
    text: 'How much physical activity should adults get per week?',
  },
  {
    icon: '🧒',
    text: 'What are the physical activity guidelines for children and adolescents?',
  },
  {
    icon: '🧓',
    text: 'What types of exercise are recommended for older adults?',
  },
  {
    icon: '🤰',
    text: 'Is physical activity safe during pregnancy? What is recommended?',
  },
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="suggestions-grid">
      {SUGGESTIONS.map((s, i) => (
        <div
          key={i}
          className="suggestion-card"
          onClick={() => onSelect(s.text)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(s.text);
          }}
        >
          <div className="suggestion-icon">{s.icon}</div>
          <span className="suggestion-text">{s.text}</span>
        </div>
      ))}
    </div>
  );
}
