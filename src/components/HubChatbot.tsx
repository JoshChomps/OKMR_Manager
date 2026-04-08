
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, User, Bot, Loader2, HardDrive } from 'lucide-react';
import { chatKnowledgeBase } from '../services/geminiService';

interface HubChatbotProps {
  appContext: string;
}

const HubChatbot: React.FC<HubChatbotProps> = ({ appContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hi! I'm Marine Bot. Ask me anything about our meetings, projects, or safety guides!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await chatKnowledgeBase(userMsg, appContext);
    setMessages(prev => [...prev, { role: 'bot', content: response || "I couldn't find that in our notes. Maybe check with an exec?" }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] no-print">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group flex items-center gap-3"
        >
          <div className="relative">
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <span className="font-black uppercase tracking-widest text-[10px] pr-2 hidden group-hover:block">Chat with AI</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl"><Sparkles size={18}/></div>
              <div>
                <p className="text-xs font-black uppercase tracking-tighter">Marine Bot</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <HardDrive size={8} className="text-emerald-500" /> Connected to Hub
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
          </div>

          <div ref={scrollRef} className="h-96 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  {m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none font-medium' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center"><Loader2 size={14} className="animate-spin text-slate-300"/></div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-16 h-8"></div>
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                placeholder="Ask a question..."
                className="w-full pl-5 pr-14 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-90"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-400 mt-3 font-black uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubChatbot;
