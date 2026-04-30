import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Zap } from 'lucide-react';
import { useSpotterAgent, SpotterMessage } from '@thoughtspot/visual-embed-sdk/react';

const WORKSHEET_ID = 'a44c223e-451f-4635-a8b0-86832bf355dd';

interface TextMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
}

interface SpotterResponseMessage {
  id: string;
  type: 'spotter';
  query: string;
  message: {
    worksheetId: string;
    convId: string;
    messageId: string;
    sessionId: string;
    genNo: number;
    acSessionId: string;
    acGenNo: number;
  };
  timestamp: Date;
}

type Message = TextMessage | SpotterResponseMessage;

const DATA_KEYWORDS = [
  'show', 'display', 'chart', 'graph', 'compare', 'how much', 'how many',
  'what is the', 'what are the', 'total', 'sum', 'average', 'count', 'number of',
  'top', 'bottom', 'highest', 'lowest', 'best', 'worst', 'breakdown', 'trend',
  'deals', 'pipeline', 'quota', 'attainment', 'win rate', 'close rate',
  'revenue', 'arr', 'mrr', 'bookings', 'opportunities', 'leads',
  'reps', 'team', 'account', 'contacts', 'activities', 'calls', 'emails',
  'cadence', 'meetings', 'demos', 'stage', 'forecast', 'at risk',
  'slipped', 'closed', 'won', 'lost', 'velocity', 'cycle', 'conversion',
  'quarterly', 'monthly', 'weekly', 'daily', 'this quarter', 'last quarter',
  'performance', 'metrics', 'kpi', 'vs', 'compared', 'per', 'by rep', 'by team',
];

const GENERAL_KEYWORDS = [
  'tell me about', 'explain', 'help', 'what does', 'describe', 'why',
  'hello', 'hi', 'hey', 'thanks', 'thank you', 'how does',
  'what should', 'suggest', 'recommend', 'who is', 'when was',
];

function classifyQuestion(q: string) {
  const lower = q.toLowerCase();
  let data = 0, general = 0;
  DATA_KEYWORDS.forEach(k => { if (lower.includes(k)) data++; });
  GENERAL_KEYWORDS.forEach(k => { if (lower.includes(k)) general++; });
  if (lower.match(/\d+/) || lower.includes('$') || lower.includes('%')) data++;
  if (lower.length < 15) general++;
  return data > general;
}

function generateTextResponse(question: string): string {
  const lower = question.toLowerCase();
  if (lower.match(/^(hi|hello|hey)/)) {
    return "Hi! I'm your Salesloft AI assistant. I can help you explore your sales data.\n\nTry asking:\n• \"Show deals at risk this quarter\"\n• \"Who are my top 5 reps by revenue?\"\n• \"Pipeline coverage by team\"\n\nWhat would you like to know?";
  }
  if (lower.match(/(thanks|thank you)/)) {
    return "Happy to help! Let me know if you have any other questions about your sales data.";
  }
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "I can help you with:\n\n📊 **Data Questions**\n• \"Show pipeline by stage\"\n• \"Top reps this quarter\"\n• \"Win rate trend by month\"\n\n💡 **Insights**\n• \"Which deals slipped this week?\"\n• \"Forecast attainment vs quota\"\n• \"Activity summary by rep\"\n\nAsk me anything about your Salesloft data!";
  }
  return "I can help you explore your Salesloft sales data.\n\nFor **data visualizations**, try:\n• \"Show pipeline by close date\"\n• \"Deal velocity this quarter\"\n\nFor **explanations**, try:\n• \"What metrics should I track?\"\n• \"Help me understand win rates\"\n\nWhat would you like to know?";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { sendMessage } = useSpotterAgent({ worksheetId: WORKSHEET_ID });

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: "Hi! I'm your Salesloft AI assistant. ⚡\n\nAsk me about your sales data:\n• \"Which deals are at risk?\"\n• \"Show top reps this quarter\"\n• \"Pipeline coverage by team\"",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, isMinimized, messages.length]);

  useEffect(() => {
    const id = setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(id);
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
    }]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (classifyQuestion(question)) {
        const result = await sendMessage(question);
        if (result.error) {
          setMessages(prev => [...prev, {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: `Couldn't query data: ${result.error}\n\n${generateTextResponse(question)}`,
            timestamp: new Date(),
          }]);
        } else if (result.message) {
          setMessages(prev => [...prev, {
            id: `spotter-${Date.now()}`,
            type: 'spotter',
            query: result.query || question,
            message: result.message,
            timestamp: new Date(),
          } as SpotterResponseMessage]);
        } else {
          setMessages(prev => [...prev, {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: generateTextResponse(question),
            timestamp: new Date(),
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: generateTextResponse(question),
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        type: 'system',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) =>
    content.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ display: 'block', marginBottom: line === '' ? 6 : 1 }}
        />
      );
    });

  return (
    <>
      {isOpen && !isMinimized && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Zap size={16} />
              <span>Salesloft AI Assistant</span>
            </div>
            <div className="chatbot-actions">
              <button className="chatbot-action-btn" onClick={() => setIsMinimized(true)} aria-label="Minimize">
                <Minimize2 size={14} />
              </button>
              <button className="chatbot-action-btn" onClick={() => { setIsOpen(false); setIsMinimized(false); setMessages([]); }} aria-label="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => {
              if (msg.type === 'spotter') {
                return (
                  <div key={msg.id} className="chatbot-message bot spotter-response">
                    <div className="chatbot-bubble bot spotter-intro">
                      Results for: "{msg.query}"
                    </div>
                    <div className="spotter-message-container">
                      <SpotterMessage message={msg.message} query={msg.query} />
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                  <div className={`chatbot-bubble ${msg.type}`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-bubble bot">
                  <div className="chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your sales data..."
              disabled={isLoading}
              className="chatbot-input"
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading} className="chatbot-send-btn">
              <Send size={16} />
            </button>
          </form>

          <div className="chatbot-footer">Powered by ThoughtSpot Spotter</div>
        </div>
      )}

      <button
        className={`chatbot-fab ${isOpen && !isMinimized ? 'active' : ''}`}
        onClick={() => {
          if (isMinimized) { setIsMinimized(false); }
          else { setIsOpen(prev => !prev); }
        }}
        aria-label="AI Assistant"
      >
        {isOpen && !isMinimized ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={22} />
            {!isOpen && <span className="chatbot-fab-badge">AI</span>}
          </>
        )}
      </button>
    </>
  );
}
