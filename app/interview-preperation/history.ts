export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  jobRole: string;
  jobCompany: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ topic: string; chunkCount: number }>;
}

export const CHAT_SESSIONS_KEY = 'chatSessions';
export const ACTIVE_SESSION_KEY = 'activeSessionId';

export const saveCurrentSession = (
  activeSessionId: string | null,
  updatedMessages: Message[],
  role: string,
  company: string,
  setChatSessions: (sessions: ChatSession[]) => void
) => {
  if (!activeSessionId) return;

  const allSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
  let sessions: ChatSession[] = allSessions ? JSON.parse(allSessions) : [];

  const sessionIndex = sessions.findIndex((s) => s.id === activeSessionId);
  const sessionTitle =
    updatedMessages.find((m) => m.role === 'user')?.content.slice(0, 50) || 'New Chat';

  const updatedSession: ChatSession = {
    id: activeSessionId,
    title: sessionTitle,
    messages: updatedMessages,
    timestamp: Date.now(),
    jobRole: role,
    jobCompany: company,
  };

  if (sessionIndex >= 0) {
    sessions[sessionIndex] = updatedSession;
  } else {
    sessions.unshift(updatedSession);
  }

  localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);

  // Update local state
  const jobSessions = sessions.filter((s) => s.jobRole === role && s.jobCompany === company);
  setChatSessions(jobSessions);
};

export const createNewChat = (
  setActiveSessionId: (id: string) => void,
  setMessages: (messages: Message[]) => void,
  sources: any[],
  role: string,
  company: string
) => {
  const newSessionId = `session_${Date.now()}`;
  setActiveSessionId(newSessionId);
  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content: `I'm your interview preparation coach. I have ${sources.length} resources loaded about ${role} interviews at ${company}. Let's start preparing! What would you like to focus on first?`,
  };
  setMessages([initialMessage]);
  localStorage.setItem(ACTIVE_SESSION_KEY, newSessionId);
};

export const loadChatSession = (
  sessionId: string,
  chatSessions: ChatSession[],
  setActiveSessionId: (id: string) => void,
  setMessages: (messages: Message[]) => void
) => {
  const session = chatSessions.find((s) => s.id === sessionId);
  if (session) {
    setActiveSessionId(sessionId);
    setMessages(session.messages);
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  }
};

export const deleteSession = (
  sessionId: string,
  role: string,
  company: string,
  activeSessionId: string | null,
  setChatSessions: (sessions: ChatSession[]) => void,
  createNewChatCallback: () => void
) => {
  const allSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
  if (allSessions) {
    let sessions: ChatSession[] = JSON.parse(allSessions);
    sessions = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));

    const jobSessions = sessions.filter((s) => s.jobRole === role && s.jobCompany === company);
    setChatSessions(jobSessions);

    if (activeSessionId === sessionId) {
      createNewChatCallback();
    }
  }
};

export const loadChatSessions = (
  role: string,
  company: string,
  setChatSessions: (sessions: ChatSession[]) => void,
  setActiveSessionId: (id: string | null) => void,
  setMessages: (messages: Message[]) => void
) => {
  const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
  const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

  if (savedSessions) {
    try {
      const sessions: ChatSession[] = JSON.parse(savedSessions);
      // Filter sessions for current job
      const jobSessions = sessions.filter((s) => s.jobRole === role && s.jobCompany === company);
      setChatSessions(jobSessions);

      // Load active session if exists
      if (savedActiveId && jobSessions.find((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
        const activeSession = jobSessions.find((s) => s.id === savedActiveId);
        if (activeSession) {
          setMessages(activeSession.messages);
        }
      } else if (jobSessions.length > 0) {
        // Load most recent session
        const mostRecent = jobSessions[0];
        setActiveSessionId(mostRecent.id);
        setMessages(mostRecent.messages);
      }
    } catch (e) {
      console.error('Error loading chat sessions:', e);
    }
  }
};
