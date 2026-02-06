const INITIAL_SUGGESTIONS = [
  "Can I change my delivery address?",
  "How do I contact customer support?",
  "What are the shipping options available?",
  "How do I reset my password?",
  "Can I purchase a gift card?",
  "What do I do if I receive a defective item?",
];

interface ChatbotSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function ChatbotSuggestions({ onSelect }: ChatbotSuggestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <div className="grid grid-cols-1 gap-2">
        {INITIAL_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="text-left text-sm md:text-xs text-theme-accent-secondary hover:text-secondary bg-white hover:bg-gray-100 rounded-xl px-4 py-3 md:px-3 md:py-2 shadow-sm transition-colors w-full"
            aria-label={`Use suggestion: ${suggestion}`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
