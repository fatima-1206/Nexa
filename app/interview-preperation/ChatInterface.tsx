'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  interviewData: {
    skills: string[];
    role: string;
    company: string;
    experience: string;
  };
  sources: any[];
  embeddingsData: string;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ topic: string; chunkCount: number }>;
  mode?: 'PREPARATION' | 'INTERVIEW';
}

type Mode = 'PREPARATION' | 'INTERVIEW';

export default function ChatInterface({
  interviewData,
  sources,
  embeddingsData,
  onBack,
}: ChatInterfaceProps) {
  // Add safety checks for interviewData
  const skills = interviewData?.skills || [];
  const role = interviewData?.role || 'Software Engineer';
  const company = interviewData?.company || 'Your Target Company';

  const [mode, setMode] = useState<Mode>('PREPARATION');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I'm your interview preparation coach. I have ${sources.length} resources loaded about ${role} interviews at ${company}. Let's start preparing! What would you like to focus on first?`,
      mode: 'PREPARATION',
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

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    
    // Add a system message when mode changes
    const modeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        newMode === 'PREPARATION'
          ? '**Switched to Preparation Mode** — I will teach and explain concepts. Ask me about topics you want to understand better.'
          : '**Switched to Interview Mode** — I will ask you questions and test your knowledge. Ready for some practice questions?',
      mode: newMode,
    };
    setMessages((prev) => [...prev, modeMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      const conversationHistory = messages
        .slice(-4)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch('/api/get-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: mode, // Now sends "PREPARATION" or "INTERVIEW" directly
          message: messageToSend,
          embeddingsData,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      let messageContent = '';
      
      // Handle PREPARATION mode (returns data object)
      if (mode === 'PREPARATION' && data.data) {
        messageContent = formatPreparedContent(data.data);
      }
      // Handle INTERVIEW mode (returns response string)
      else if (mode === 'INTERVIEW' && data.response) {
        messageContent = data.response;
      }
      // Fallback
      else {
        messageContent = data.response || 'No response generated';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: messageContent,
        sources: data.sources,
        mode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        mode,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepare = async (topics: string[]) => {
      setLoading(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Prepare me on: ${topics.join(', ')}`,
        mode: 'PREPARATION',
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch('/api/get-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: 'PREPARATION',
            message: topics.join(', '),
            embeddingsData,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate preparation content');
        }

        const preparationContent = formatPreparedContent(data.data);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: preparationContent,
          mode: 'PREPARATION',
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error in preparation mode:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Failed to generate preparation content. Please try again.',
          mode: 'PREPARATION',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
  };

  const formatPreparedContent = (data: Record<string, any>): string => {
    if (!data) return '';
    
    return Object.entries(data)
      .map(([topic, content]: [string, any]) => {
        const keyPointsText =
          content.keyPoints && content.keyPoints.length > 0
            ? content.keyPoints.map((p: string) => `- ${p}`).join('\n')
            : 'No key points found';
        const mistakesText =
          content.commonMistakes && content.commonMistakes.length > 0
            ? content.commonMistakes.map((m: string) => `- ${m}`).join('\n')
            : 'No common mistakes listed';

        return `## ${topic}\n\n${content.explanation}\n\n### Key Points\n${keyPointsText}\n\n### Common Mistakes\n${mistakesText}`;
      })
      .join('\n\n---\n\n');
  };

  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50'
          : 'relative rounded-lg border border-neutral-700 max-h-[calc(100vh-200px)]'
      } flex bg-neutral-900 overflow-hidden transition-all duration-300`}
    >
      {/* Full Screen Toggle Button */}
      <button
        onClick={() => setFullScreen((v) => !v)}
        className="absolute top-4 right-4 z-50 bg-neutral-800 border border-neutral-700 rounded-full p-2 hover:bg-orange-500/20 transition-colors"
        aria-label={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
        type="button"
      >
        {fullScreen ? (
          <Minimize2 className="w-5 h-5 text-orange-500" />
        ) : (
          <Maximize2 className="w-5 h-5 text-orange-500" />
        )}
      </button>

      {/* Sources Sidebar */}
      <div className="w-80 border-r border-neutral-700 bg-neutral-900 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-700">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h3 className="text-lg font-bold text-orange-500 tracking-wider">Resources</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sources && sources.length > 0 ? (
            sources.map((source, idx) => (
              <a
                key={source.id ?? source.url ?? idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded bg-neutral-800 border border-neutral-700 hover:bg-orange-500/10 hover:border-orange-500/50 transition"
              >
                <div className="font-semibold text-orange-400 truncate">{source.title}</div>
                <div className="text-neutral-400 text-xs line-clamp-2">{source.description}</div>
              </a>
            ))
          ) : (
            <p className="text-neutral-500 text-sm">No resources loaded</p>
          )}
        </div>

        {/* Quick Prepare Buttons */}
        <div className="p-4 border-t border-neutral-700 space-y-2">
          <p className="text-sm font-semibold text-orange-500 mb-3">Quick Prepare</p>
          {skills && skills.length > 0 ? (
            skills.slice(0, 3).map((skill) => (
              <button
                key={skill}
                onClick={() => handlePrepare([skill])}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-xs rounded bg-neutral-800 border border-neutral-700 hover:bg-orange-500/10 hover:border-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-orange-300"
              >
                {skill}
              </button>
            ))
          ) : (
            <p className="text-neutral-500 text-xs">No skills to prepare</p>
          )}
        </div>

        {/* Interview Details */}
        <div className="p-4 border-t border-neutral-700 space-y-3">
          <p className="font-semibold text-orange-500 text-sm">Interview Details</p>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-neutral-500">Role:</span>
              <p className="text-neutral-300 font-medium">{role}</p>
            </div>
            <div>
              <span className="text-neutral-500">Company:</span>
              <p className="text-neutral-300 font-medium">{company}</p>
            </div>
            {interviewData?.experience && (
              <div>
                <span className="text-neutral-500">Experience:</span>
                <p className="text-neutral-300 font-medium">{interviewData.experience}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Mode Toggle Header */}
        <div className="border-b border-neutral-700 bg-neutral-900 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-orange-500">Interview Coach</h2>
          
          {/* Mode Toggle Slider */}
          <div className="flex items-center gap-3 mr-20">

            <div
              className={`relative w-16 h-8 ${
                mode === 'INTERVIEW' ? 'bg-orange-500' : 'bg-neutral-700'
              } rounded-full cursor-pointer transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (!loading) handleModeChange(mode === 'PREPARATION' ? 'INTERVIEW' : 'PREPARATION');
              }}
            >
              <div
                className={`absolute top-1/2 left-1 w-6 h-6 ${
                  mode === 'INTERVIEW' ? 'bg-neutral-900' : 'bg-white'
                } rounded-full shadow-md transform -translate-y-1/2 transition-transform ${
                  mode === 'INTERVIEW' ? 'translate-x-8' : 'translate-x-0'
                }`}
              ></div>
            </div>
            <span className="text-sm font-semibold text-neutral-400">
              {mode === 'PREPARATION' ? 'Preparation' : 'Interview'}
            </span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-orange-500/20 border border-orange-500/50 text-white'
                    : 'bg-neutral-800 border border-neutral-700 text-neutral-100'
                }`}
              >
                <div className="text-sm prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-orange-400 mt-4 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-orange-300 mt-3 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-orange-300" {...props} />,
                      hr: ({ node, ...props }) => <hr className="my-4 border-neutral-600" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-700 text-xs text-neutral-400 space-y-1">
                    <p className="font-semibold text-orange-400"> Sources:</p>
                    {message.sources.map((source, idx) => (
                      <p key={idx} className="text-neutral-400">
                        • {source.topic} ({source.chunkCount} chunks)
                      </p>
                    ))}
                  </div>
                )}
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
              placeholder={
                mode === 'PREPARATION'
                  ? 'Ask to learn about a topic...'
                  : 'Press Enter to get a question...'
              }
              disabled={loading}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 transition-all"
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