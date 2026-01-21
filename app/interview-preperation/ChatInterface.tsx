'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  interviewData: {
    skills: string[];
    role: string;
    company: string;
    experience: string;
  };
  sources: any[];
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface({
  interviewData,
  sources,
  onBack,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I'm your interview preparation coach. I have ${sources.length} resources loaded about ${interviewData.role} interviews at ${interviewData.company}. Let's start preparing! What would you like to focus on first?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Great question about ${interviewData.role} interviews! Based on the resources we have, here are some insights...`,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex gap-6 ${
        fullScreen
          ? 'fixed inset-0 z-50 bg-neutral-900'
          : 'h-screen max-h-[calc(100vh-200px)]'
      } bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden transition-all duration-300`}
    >
      {/* Full Screen Toggle Button */}
      <button
        onClick={() => setFullScreen((v) => !v)}
        className="absolute top-4 right-4 z-50 bg-neutral-800 border border-neutral-700 rounded-full p-2 hover:bg-orange-500/20 transition-colors"
        aria-label={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
        type="button"
      >
        {fullScreen ? <Minimize2 className="w-5 h-5 text-orange-500" /> : <Maximize2 className="w-5 h-5 text-orange-500" />}
      </button>

      {/* Sources Sidebar */}
      <div className="w-80 border-r border-neutral-700 bg-neutral-900 flex flex-col">
        <div className="p-4 border-b border-neutral-700">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h3 className="text-lg font-bold text-orange-500 tracking-wider">Selected Resources</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-neutral-800 border border-neutral-700 rounded hover:border-orange-500/50 hover:bg-neutral-800/70 transition-all group"
            >
              <p className="text-sm font-semibold text-orange-500 group-hover:text-orange-400 line-clamp-2">
                {source.title}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{source.source}</p>
            </a>
          ))}
        </div>

        <div className="p-4 border-t border-neutral-700 bg-neutral-900/70">
          <div className="text-sm text-neutral-400">
            <p className="font-semibold text-orange-500 mb-2">Interview Details</p>
            <p className="text-xs mb-1"><span className="text-neutral-500">Role:</span> {interviewData.role}</p>
            <p className="text-xs mb-1"><span className="text-neutral-500">Company:</span> {interviewData.company}</p>
            <p className="text-xs mb-1"><span className="text-neutral-500">Experience:</span> {interviewData.experience}</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-orange-500/20 border border-orange-500/50 text-white'
                    : 'bg-neutral-800 border border-neutral-700 text-neutral-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-700 bg-neutral-900 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your interview coach..."
              disabled={loading}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}