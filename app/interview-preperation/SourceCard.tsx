import { ExternalLink, Check } from 'lucide-react';

interface SourceCardProps {
  source: {
    id: string;
    title: string;
    source: string;
    url: string;
    description: string;
    relevance: number;
  };
  selected: boolean;
  onToggle: () => void;
}

export default function SourceCard({ source, selected, onToggle }: SourceCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        selected
          ? 'bg-orange-500/20 border-orange-500/50'
          : 'bg-neutral-800 border-neutral-700 hover:border-orange-500/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{source.title}</h3>
          <p className="text-sm text-neutral-400 mb-2">{source.description}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-neutral-700 rounded text-xs text-orange-500">
              {source.source}
            </span>
            <span className="text-xs text-neutral-500">
              {source.relevance}% relevant
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              selected
                ? 'bg-orange-500 border-orange-500'
                : 'border-neutral-600 hover:border-orange-400'
            }`}
          >
            {selected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      </div>
    </div>
  );
}