const SUGGESTIONS = [
  { name: "Calm CBD Gummies", count: 112 },
  { name: "Sleep CBD Gummies", count: 98 },
  { name: "Focus CBD Capsules", count: 87 },
  { name: "Relief CBD Oil", count: 156 },
  { name: "Energy CBD Gummies", count: 73 },
  { name: "Relax CBD Tincture", count: 92 },
];

interface SearchSuggestionsProps {
  onSelect: (name: string) => void;
}

export function SearchSuggestions({ onSelect }: SearchSuggestionsProps) {
  return (
    <div className="mb-8">
      <div className="rounded-2xl">
        <h3
          className="text-white font-semibold text-lg mb-4"
          id="suggestions-title"
        >
          Sugestões
        </h3>
        <hr className="mb-3" />
        <div
          className="space-y-2"
          role="list"
          aria-labelledby="suggestions-title"
        >
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion.name)}
              className="w-full flex items-center justify-between p-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              aria-label={`Buscar por ${suggestion.name}`}
            >
              <span className="text-white/80 text-sm">{suggestion.name}</span>
              <span className="text-white/60 text-xs">{suggestion.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
