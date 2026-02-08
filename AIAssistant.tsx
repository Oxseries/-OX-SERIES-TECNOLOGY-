
import React, { useState, useRef, useEffect } from 'react';
import { getSkincareAdvice } from '../geminiService';
import { Message } from '../types';

interface AIAssistantProps {
  lang: 'tr' | 'en';
  t: (key: any) => string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ lang, t }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('ai_greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const expertImageUrl = "https://lh3.googleusercontent.com/d/1pAknlaeenHyU4mio8J1eqFkypg1N1duv";
  const utsImageUrl = "https://lh3.googleusercontent.com/d/14KRnNHIhGgurbILLRbwl3wEm8jrTgcue";

  // Watch for language changes to update greeting
  useEffect(() => {
    setMessages(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0 && newHistory[0].role === 'assistant') {
            newHistory[0] = { ...newHistory[0], content: t('ai_greeting') };
        }
        return newHistory;
    });
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setIsLoading(true);

    try {
      const response = await getSkincareAdvice([...messages, userMsg], lang);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response || t('ai_no_response')
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai_error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { key: 'ai_chip_oily', icon: '💧' },
    { key: 'ai_chip_dry', icon: '🌵' },
    { key: 'ai_chip_sensitive', icon: '🌸' },
    { key: 'ai_chip_antiaging', icon: '⏳' }
  ];

  return (
    <section id="ai" className="relative py-16 md:py-48 px-4 md:px-6 bg-brand-white text-brand-black overflow-hidden scroll-mt-20 md:scroll-mt-32 border-y border-brand-border">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-white via-brand-white/80 to-transparent z-10"></div>
        <img 
          src={expertImageUrl} 
          alt="OX Expert Visual" 
          className="absolute right-0 top-0 w-full lg:w-3/4 h-full object-cover opacity-10 lg:opacity-30 grayscale"
        />
        <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="flex flex-col items-start text-left mb-10 md:mb-20 space-y-4 md:space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-brand-black/5 rounded-full bg-white/80 backdrop-blur-md shadow-sm animate-fade-in">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse"></span>
            <span className="text-[7px] md:text-[9px] font-mono font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-brand-black/40">{t('expert_badge')}</span>
          </div>
          
          <div className="space-y-3 md:space-y-4 max-w-4xl">
            <h2 className="text-5xl md:text-7xl lg:text-[7rem] font-header font-black tracking-widest leading-[0.9] uppercase">
              {t('expert_title')}
            </h2>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="h-px bg-brand-gold/40 w-10 md:w-24"></div>
              <p className="text-brand-black/40 text-[7px] md:text-[10px] font-mono font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase">Laboratory Analysis v3.0</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-12 items-stretch min-h-[400px] md:min-h-[700px]">
          
          <div className="lg:col-span-4 space-y-8 hidden lg:flex flex-col">
            <div className="flex-1 bg-white/40 backdrop-blur-xl border border-brand-border rounded-[3rem] p-12 space-y-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 text-[15rem] font-header font-black text-brand-gold/[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">OX</div>
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-brand-gold uppercase tracking-[0.3em]">Specialist</h4>
                  <p className="text-3xl font-header font-black uppercase tracking-widest">AI Diagnostic Center</p>
                </div>
                <p className="text-base text-brand-black/50 leading-relaxed font-light italic">
                  {lang === 'tr' 
                    ? 'Cilt tipinizi analiz ederek size en uygun OX SERIES ritüelini saniyeler içinde oluşturalım.' 
                    : 'Analyze your skin type and let us create the ideal OX SERIES ritual for you in seconds.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {quickActions.map(action => (
                  <button
                    key={action.key}
                    onClick={() => handleSend(t(action.key))}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white border border-brand-border hover:border-brand-gold/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 group/item"
                  >
                    <span className="text-3xl group-hover/item:scale-125 transition-transform duration-500">{action.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-black/40 group-hover/item:text-brand-gold transition-colors">{t(action.key)}</span>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-brand-black/5 flex items-center justify-between opacity-30 relative z-10">
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest">
                  {lang === 'tr' ? 'Bilimsel Çekirdek Aktif' : 'Scientific Core Active'}
                </span>
                <span className="text-brand-gold">✧</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 w-full flex flex-col h-[550px] md:h-auto">
            <div className="bg-white/70 backdrop-blur-3xl border border-brand-border rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-xl md:shadow-[0_80px_120px_-30px_rgba(0,0,0,0.08)] flex flex-col h-full relative">
              
              <div className="px-5 py-4 md:px-10 md:py-10 border-b border-brand-black/5 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="relative">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-black flex items-center justify-center text-white text-[9px] md:text-[11px] font-bold shadow-2xl">OX</div>
                    <div className="absolute -bottom-1 -right-1 w-2 md:w-3 h-2 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-sm font-bold tracking-tight uppercase">OX Expert</span>
                    <span className="text-[6px] md:text-[8px] font-mono font-bold text-brand-black/30 uppercase tracking-[0.2em]">Encrypted</span>
                  </div>
                </div>
                <div className="px-2.5 py-0.5 md:px-3 md:py-1 bg-brand-gold/10 rounded-full text-[6px] md:text-[8px] font-bold text-brand-gold uppercase tracking-widest">Live</div>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 md:p-14 space-y-6 md:space-y-10 hide-scrollbar scroll-smooth"
              >
                {messages.map((m, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                  >
                    <div 
                      className={`max-w-[90%] md:max-w-[75%] px-5 py-4 md:px-10 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] text-[13px] md:text-lg leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-brand-black text-white rounded-tr-none' 
                          : 'bg-white border border-brand-border text-brand-black rounded-tl-none italic font-light'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-2 px-2 animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 md:p-12 bg-white/60 border-t border-brand-black/5">
                <div className="lg:hidden flex gap-2.5 overflow-x-auto hide-scrollbar pb-4 mb-4 border-b border-brand-black/5">
                  {quickActions.map(action => (
                    <button
                      key={action.key}
                      onClick={() => handleSend(t(action.key))}
                      className="flex-shrink-0 px-4 py-2 rounded-full bg-white border border-brand-border text-[7px] font-bold uppercase tracking-widest text-brand-black/50 active:bg-brand-black active:text-white transition-colors"
                    >
                      {action.icon} {t(action.key)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 md:gap-6">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('ai_placeholder')}
                    className="flex-1 bg-white border border-brand-border rounded-xl md:rounded-[2rem] px-4 py-3 md:px-10 md:py-7 focus:outline-none focus:border-brand-gold/40 text-[13px] md:text-lg"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="w-12 h-12 md:w-[76px] md:h-[76px] bg-brand-black text-white rounded-xl md:rounded-[2rem] flex items-center justify-center disabled:opacity-20 shadow-lg"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:w-5 md:h-5">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-2">
                  <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-brand-black/[0.02] rounded-full border border-brand-black/5">
                    <span className="text-[7px] md:text-[8px] font-mono font-bold text-brand-black/20 uppercase tracking-[0.3em] md:tracking-[0.4em]">ÜTS</span>
                    <div className="w-px h-2.5 md:h-3 bg-brand-black/10"></div>
                    <img src={utsImageUrl} alt="ÜTS" className="h-3 md:h-4 w-auto grayscale opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
