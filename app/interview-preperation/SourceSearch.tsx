'use client';

import { useState, useEffect } from 'react';
import SourceCard from './SourceCard';
import { Search, Plus, Check, Loader, ChevronLeft, RefreshCw } from 'lucide-react';
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
  onComplete: (sources: any[], embeddingsData: string) => void;
  onBack: () => void;
}

const LOCAL_STORAGE_KEY = 'selectedSources';
const SEARCH_TIMEOUT = 15000; // 15 seconds timeout

export default function SourceSearch({ interviewData, onComplete, onBack }: SourceSearchProps) {
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [customLink, setCustomLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load selected sources from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setSelectedSources(new Set(JSON.parse(saved)));
    }
    searchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save selected sources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(selectedSources)));
  }, [selectedSources]);

  const searchSources = async () => {
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('The search request timed out. Please try again.');
    }, SEARCH_TIMEOUT);

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
      clearTimeout(timeoutId); // Clear the timeout if the request succeeds
      
      if (!res.ok) {
        throw new Error(`Failed to fetch sources: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);

      if (data.success && data.data && data.data.curatedSources) {
        // Ensure unique keys by combining url and index
        const mappedSources = data.data.curatedSources.map((src: any, idx: number) => ({
          id: src.url ? `${src.url}__${idx}` : idx.toString(),
          title: src.title,
          source: src.domain,
          url: src.url,
          description: src.snippet,
          relevance: src.credibilityScore || 80,
        }));
        setSources(mappedSources);
        console.log('Mapped Sources:', mappedSources);
      } else {
        setSources([]);
      }
    } catch (error) {
      console.error('Error searching sources:', error);
      setError('Failed to fetch sources. Please try again.');
      setSources([]);
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
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

  const handleComplete = async () => {
    const selected = sources.filter(s => selectedSources.has(s.id));
    setBuilding(true);
    setBuildProgress('Saving sources...');

    try {
      // Step 1: Save sources
      await fetch('/api/save-selected-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: selected }),
      });

      setBuildProgress('Building vector database...');

      // Step 2: Build vector DB
      const response = await fetch('/api/build-vector-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: selected }),
      });

      if (!response.ok) {
        throw new Error(`Vector DB build failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to build vector database');
      }

      setBuildProgress('Preparing embeddings...');

      // Extract vector store data
      const embeddingsData = data.vectorStore;

      setBuildProgress('Done! Redirecting to chat...');

      // Pass embeddingsData to parent
      onComplete(selected, embeddingsData);
    } catch (error) {
      console.error('Error building vector DB:', error);
      setBuilding(false);
      setBuildProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setBuildProgress(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={searchSources}
              className="px-6 bg-orange-500 hover:bg-orange-600 text-white rounded flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
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
        {!loading && !error && sources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400">No sources found. Please try again later.</p>
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
              disabled={building}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />
            <Button
              onClick={handleAddCustomLink}
              disabled={building}
              className="px-6 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-500 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>

        {selectedSources.size > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            {building && (
              <div className="bg-neutral-800 border border-orange-500/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                  <span className="text-orange-500 font-semibold">Building Vector Database...</span>
                </div>
                <p className="text-neutral-400 text-sm ml-8">{buildProgress}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                disabled={building}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-2 transition-all transform hover:scale-105"
              >
                {building ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Building...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Continue with {selectedSources.size} Resource(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}