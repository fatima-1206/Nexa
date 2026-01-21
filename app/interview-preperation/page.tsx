'use client';

import { useState } from 'react';
import InputForm from "./InputForm";
import SourceSearch from './SourceSearch';
import ChatInterface from './ChatInterface';

type PageStep = 'input' | 'sources' | 'chat';

export default function InterviewPreparationPage() {
  const [step, setStep] = useState<PageStep>('input');
  const [interviewData, setInterviewData] = useState({
    skills: [] as string[],
    role: '',
    company: '',
    experience: '',
  });
  const [selectedSources, setSelectedSources] = useState<any[]>([]);

  const handleInputSubmit = (data: typeof interviewData) => {
    setInterviewData(data);
    setStep('sources');
  };

  const handleSourcesComplete = (sources: any[]) => {
    setSelectedSources(sources);
    setStep('chat');
  };

  const handleBackToSources = () => {
    setStep('sources');
    setSelectedSources([]);
  };

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