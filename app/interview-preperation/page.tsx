'use client';

import { useState, useEffect } from 'react';
import InputForm from "./InputForm";
import SourceSearch from './SourceSearch';
import ChatInterface from './ChatInterface';

type PageStep = 'input' | 'sources' | 'chat';

const LOCAL_STORAGE_KEY = 'selectedSources';
const LOCAL_STORAGE_SOURCES_KEY = 'persistedSources';

export default function InterviewPreparationPage() {
  const [step, setStep] = useState<PageStep>('input');
  const [interviewData, setInterviewData] = useState({
    skills: [] as string[],
    role: '',
    company: '',
    experience: '',
  });
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // On mount, check localStorage for persisted sources and selected sources
  useEffect(() => {
    const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedSources = localStorage.getItem(LOCAL_STORAGE_SOURCES_KEY);

    async function fetchSelectedSources() {
      try {
        const res = await fetch('/api/load-selected-sources');
        const data = await res.json();
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          setSelectedSources(data.sources);
          setStep('chat');
          setLoading(false);
          return;
        }
      } catch (e) {
        // handle error if needed
      }
      setLoading(false);
      setStep('input');
    }

    if (savedSelected) {
      try {
        const parsed = JSON.parse(savedSelected);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedSources(parsed);
          setStep('chat');
          setLoading(false);
          return;
        }
      } catch {}
    } else {
      fetchSelectedSources();
      return;
    }

    if (savedSources) {
      try {
        const parsed = JSON.parse(savedSources);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStep('sources');
          setLoading(false);
          return;
        }
      } catch {}
    }
    setStep('input');
    setLoading(false);
  }, []);

  const handleInputSubmit = (data: typeof interviewData) => {
    setInterviewData(data);
    setStep('sources');
  };

  // When sources are selected, persist them
  const handleSourcesComplete = (sources: any[]) => {
    setSelectedSources(sources);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sources));
    setStep('chat');
  };

  // When going back to sources, clear selected sources
  const handleBackToSources = () => {
    setStep('sources');
    setSelectedSources([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black">
        <span className="text-orange-500 text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-2 neon-glow">
          Interview Preparation
        </h1>
        <p className="text-neutral-400 mb-8">Master your interview with AI-powered preparation</p>

        {step === 'input' && <InputForm onSubmit={handleInputSubmit} />}

        {step === 'sources' && (
          <SourceSearch
            interviewData={interviewData}
            onComplete={handleSourcesComplete}
            onBack={() => setStep('input')}
          />
        )}

        {step === 'chat' && (
          <ChatInterface
            interviewData={interviewData}
            sources={selectedSources}
            onBack={handleBackToSources}
          />
        )}
      </div>
    </div>
  );
}