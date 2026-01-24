'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AILoading from '@/components/kokonutui/ai-loading';
import ReactMarkdown from 'react-markdown';
import {
  Message,
  ChatSession,
  saveCurrentSession as saveSession,
  createNewChat as createChat,
  loadChatSession as loadSession,
  deleteSession as removeSession,
  loadChatSessions,
} from './history';


interface ChatInterfaceProps {
  interviewData: {
    companyName: string;
    role: string;
    missingSkills: string[];
    roleSeniority: string;
    techStack: string[];
    interviewType: string;
  };
  sources: any[];
  embeddingsData: string;
  onBack: () => void;
  isPreparingResources?: boolean;
  preparationStatus?: string;
  logs?: string[];
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
  isPreparingResources = false,
  preparationStatus = '',
  logs = [],
}: ChatInterfaceProps) {
  const missingSkills = interviewData?.missingSkills || [];
  const techStack = interviewData?.techStack || [];
  const role = interviewData?.role || 'Software Engineer';
  const company = interviewData?.companyName || 'Your Target Company';

  const [mode, setMode] = useState<Mode>('PREPARATION');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveSession = (updatedMessages: Message[]) => {
    saveSession(activeSessionId, updatedMessages, role, company, setChatSessions);
  };

  const handleCreateNewChat = () => {
    createChat(setActiveSessionId, setMessages, sources, role, company);
  };

  const handleLoadChatSession = (sessionId: string) => {
    loadSession(sessionId, chatSessions, setActiveSessionId, setMessages);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSession(sessionId, role, company, activeSessionId, setChatSessions, handleCreateNewChat);
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    loadChatSessions(role, company, setChatSessions, setActiveSessionId, setMessages);
  }, [role, company]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
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
          mode: mode,
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
      
      if (mode === 'PREPARATION' && data.data) {
        messageContent = formatPreparedContent(data.data);
      } else if (mode === 'INTERVIEW' && data.response) {
        messageContent = data.response;
      } else {
        messageContent = data.response || 'No response generated';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: messageContent,
        sources: data.sources,
        mode,
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      if (!activeSessionId) {
        const newSessionId = `session_${Date.now()}`;
        setActiveSessionId(newSessionId);
      }
      
      setTimeout(() => handleSaveSession(updatedMessages), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        mode,
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      setTimeout(() => handleSaveSession(updatedMessages), 100);
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

  // If preparing resources, show loading state
  if (isPreparingResources) {
    return (
      <div className="flex-1 flex flex-col p-6 overflow-hidden h-full">
        <div className="max-w-4xl w-full mx-auto space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-orange-500 mb-2">Preparing Your Interview Resources</h3>
            <p className="text-neutral-400 text-lg">{preparationStatus || 'Setting up your personalized AI coach...'}</p>
          </div>
          
          <div className="flex-1 bg-black border-2 border-orange-500/50 rounded-lg p-6 overflow-y-auto shadow-2xl" style={{ minHeight: '500px' }}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-orange-500/30">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-400 font-mono text-base font-bold tracking-wider">🔴 LIVE CONSOLE</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  <p>Initializing...</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-neutral-200 animate-fadeIn leading-relaxed">
                    <span className="text-orange-500/70 mr-3">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-green-400">&gt;</span> {log}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              <span className="font-mono text-sm">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden">
      {/* Sources Sidebar */}
      <div className="w-80 border-r border-neutral-700 bg-neutral-900 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-neutral-700 flex-shrink-0">
          <h3 className="text-lg font-bold text-orange-500 tracking-wider">Resources</h3>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '260px' }}>
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

        {/* Chat History */}
        <div className="flex-1 border-t border-neutral-700 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-between flex-shrink-0">
            <p className="text-sm font-semibold text-orange-500">Your Chats</p>
            <button
              onClick={handleCreateNewChat}
              className="px-3 py-1 text-xs rounded bg-orange-500 hover:bg-orange-600 text-white transition font-medium"
              title="New Chat"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleLoadChatSession(session.id)}
                  className={`group relative p-3 rounded cursor-pointer transition ${
                    activeSessionId === session.id
                      ? 'bg-orange-500/20 border border-orange-500/50'
                      : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  <div className="text-xs text-neutral-300 truncate pr-6">{session.title}</div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition"
                    title="Delete chat"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-xs text-center py-4">No chat history yet</p>
            )}
          </div>
        </div>

        {/* Interview Details */}
        <div className="p-4 border-t border-neutral-700 space-y-3 flex-shrink-0">
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
            {interviewData?.roleSeniority && (
              <div>
                <span className="text-neutral-500">Seniority:</span>
                <p className="text-neutral-300 font-medium">{interviewData.roleSeniority}</p>
              </div>
            )}
            {interviewData?.interviewType && (
              <div>
                <span className="text-neutral-500">Interview Type:</span>
                <p className="text-neutral-300 font-medium">{interviewData.interviewType}</p>
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
          
          <div className="flex items-center gap-3">
            <div
              className={`relative w-16 h-8 ${
                mode === 'INTERVIEW' ? 'bg-orange-500' : 'bg-orange-500'
              } rounded-full cursor-pointer transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (!loading) handleModeChange(mode === 'PREPARATION' ? 'INTERVIEW' : 'PREPARATION');
              }}
            >
              <div
                className={`absolute top-1/2 left-1 w-6 h-6 bg-neutral-900 rounded-full shadow-md transform -translate-y-1/2 transition-transform ${
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={messagesContainerRef}>
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
                    <p className="font-semibold text-orange-400">📚 Sources:</p>
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
            <div className="flex justify-center my-4">
              <div className="w-full max-w-md">
                <AILoading />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-110 z-50 border-2 border-orange-400/50 animate-bounce"
            aria-label="Scroll to bottom"
            style={{
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)'
            }}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}

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