'use client';

import { useState, useEffect } from 'react';
import InputForm from "./InputForm";
import SourceSearch from './SourceSearch';
import ChatInterface from './ChatInterface';

type PageStep = 'input' | 'sources' | 'chat';

const LOCAL_STORAGE_KEY = 'selectedSources';
const LOCAL_STORAGE_SOURCES_KEY = 'persistedSources';
const LOCAL_STORAGE_EMBEDDINGS_KEY = 'embeddingsData';

export default function InterviewPreparationPage() {
  const [step, setStep] = useState<PageStep>('input');
  const [interviewData, setInterviewData] = useState({
    skills: [] as string[],
    role: '',
    company: '',
    experience: '',
  });
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [embeddingsData, setEmbeddingsData] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedEmbeddings = localStorage.getItem(LOCAL_STORAGE_EMBEDDINGS_KEY);

    async function fetchSelectedSources() {
      try {
        const res = await fetch('/api/load-selected-sources');
        const data = await res.json();
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          setSelectedSources(data.sources);
          
          // Try to load embeddings
          if (data.embeddingsData) {
            setEmbeddingsData(data.embeddingsData);
            setStep('chat');
          } else {
            setStep('sources');
          }
          
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error fetching selected sources:', e);
      }
      setLoading(false);
      setStep('input');
    }

    if (savedSelected && savedEmbeddings) {
      try {
        const parsed = JSON.parse(savedSelected);
        const embeddingsParsed = JSON.parse(savedEmbeddings);
        
        if (Array.isArray(parsed) && parsed.length > 0 && embeddingsParsed) {
          setSelectedSources(parsed);
          setEmbeddingsData(embeddingsParsed);
          setStep('chat');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved data:', e);
      }
    }

    if (savedSelected) {
      try {
        const parsed = JSON.parse(savedSelected);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedSources(parsed);
          setStep('sources');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved sources:', e);
      }
    }

    fetchSelectedSources();
  }, []);

  const handleInputSubmit = (data: typeof interviewData) => {
    setInterviewData(data);
    setStep('sources');
  };

  const handleSourcesComplete = (sources: any[], newEmbeddingsData: string) => {
    setSelectedSources(sources);
    setEmbeddingsData(newEmbeddingsData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sources));
    localStorage.setItem(LOCAL_STORAGE_EMBEDDINGS_KEY, JSON.stringify(newEmbeddingsData));
    setStep('chat');
  };

  const handleBackToSources = () => {
    setStep('sources');
    setSelectedSources([]);
    setEmbeddingsData('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_EMBEDDINGS_KEY);
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

        {step === 'chat' && embeddingsData && (
          <ChatInterface
            interviewData={interviewData}
            sources={selectedSources}
            embeddingsData={embeddingsData}
            onBack={handleBackToSources}
          />
        )}
      </div>
    </div>
  );
}