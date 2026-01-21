'use client';

import { useState, useEffect } from 'react';
import SourceCard from './SourceCard';
import { Search, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SourceSearchProps {
  interviewData: {
    companyName: string;
    role: string;
    missingSkills: string[];
    roleSeniority: string;
    techStack: string[];
    interviewType: string;
  };
  onComplete: (sources: any[]) => void;
  onBack: () => void;
}

export default function SourceSearch({ interviewData, onComplete, onBack }: SourceSearchProps) {
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [customLink, setCustomLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchSources = async () => {
    setLoading(true);
    try {
      // Prepare the payload for your API
      const payload = {
        companyName: interviewData.companyName,
        role: interviewData.role,
        missingSkills: interviewData.missingSkills,
        roleSeniority: interviewData.roleSeniority,
        techStack: interviewData.techStack,
        interviewType: interviewData.interviewType,
      };

      const res = await fetch('/api/find-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data && data.data.curatedSources) {
        // Map backend sources to your frontend format if needed
        const mappedSources = data.data.curatedSources.map((src: any, idx: number) => ({
          id: src.url || idx.toString(),
          title: src.title,
          source: src.domain,
          url: src.url,
          description: src.snippet,
          relevance: src.credibilityScore || 80,
        }));
        setSources(mappedSources);
      } else {
        setSources([]);
      }
    } catch (error) {
      console.error('Error searching sources:', error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomLink = () => {
    if (customLink.trim()) {
      const newSource = {
        id: Date.now().toString(),
        title: `Custom Resource`,
        source: 'Custom',
        url: customLink,
        description: 'User-provided resource',
        relevance: 80,
      };
      setSources([...sources, newSource]);
      setCustomLink('');
    }
  };

  const toggleSource = (id: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSources(newSelected);
  };

  const handleComplete = () => {
    const selected = sources.filter(s => selectedSources.has(s.id));
    onComplete(selected);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-neutral-700 text-neutral-400 hover:bg-neutral-800"
        >
          Back
        </Button>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-orange-500 mb-4 tracking-wider">Recommended Resources</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Search className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-neutral-400 mt-4">Searching for relevant resources...</p>
          </div>
        ) : (
          <div className="grid gap-4 mb-6">
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                selected={selectedSources.has(source.id)}
                onToggle={() => toggleSource(source.id)}
              />
            ))}
          </div>
        )}

        <div className="border-t border-neutral-700 pt-6">
          <h3 className="text-lg font-semibold text-orange-500 mb-4">Add Custom Resource</h3>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste resource link here..."
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLink()}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
            <Button
              onClick={handleAddCustomLink}
              className="px-6 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-500 rounded flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>

        {selectedSources.size > 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleComplete}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Check className="w-4 h-4" /> Continue with {selectedSources.size} Resource(s)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}