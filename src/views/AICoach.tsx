import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, HelpCircle, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AICoach: React.FC = () => {
  const { user } = useAuth();
  const username = user?.name || 'Dhruv';
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Hello ${username}, I am your Kinova AI Recovery Coach. I track your performance data and joint angles to answer questions about form corrections, pain triggers, and protocol targets. Ask me anything!`,
      timestamp: '16:00'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const suggestedQuestions = [
    'Why does my knee collapse during squats?',
    'Explain rotator cuff healing timelines',
    'How does pacing affect joint loading?',
    'What should I do if my shoulder hurts at 120°?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate dynamic mock clinical response
    setTimeout(() => {
      let aiText = '';
      const query = textToSend.toLowerCase();

      if (query.includes('knee') || query.includes('squat')) {
        aiText = 'Knee collapse (valgus) during squats typically stems from hip abductor weakness (specifically the gluteus medius). Focus on pressing your knees outward against an imaginary resistance band during descent, keeping your heels flat to load your posterior chain.';
      } else if (query.includes('shoulder') || query.includes('rotator')) {
        aiText = 'Rotator cuff recovery takes time due to limited vascular supply in tendon attachments. Ensure you raise your arm directly sideways in a pain-free range (below 130°). Shrugging your shoulders triggers compensatory trapezius activation which impairs biomechanics.';
      } else if (query.includes('pain') || query.includes('hurt')) {
        aiText = 'If joint pain exceeds 4/10 on your subjective pain index, freeze the routine immediately. Pain is a biomechanical warning. Try reducing range of motion by 15° and confirm your alignment in the onboarding calibration screen.';
      } else {
        aiText = `Based on your kinematic profile, your consistency is excellent at 94%. I suggest sticking to Dr. Robert's prescription of 3 sets of 15 repetitions. Let me know if you experience joint pinching.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 900);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      
      {/* Suggestions column */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4 lg:col-span-1 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-brand-500" />
            Suggested Prompts
          </h3>
          <div className="space-y-2.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-brand-500/30 text-[11px] font-semibold text-[var(--text-primary)] leading-normal cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/10 text-[10px] leading-relaxed text-[var(--text-secondary)] font-semibold flex gap-2">
          <Activity className="h-4 w-4 text-brand-500 shrink-0" />
          <span>Kinova Coach uses clinical guidelines to review joint trajectories. Consult your physical therapist for formal prescriptions.</span>
        </div>
      </div>

      {/* Main chat dialogue dialogue */}
      <div className="lg:col-span-3 glass-card rounded-2xl border border-[var(--border-color)] flex flex-col overflow-hidden h-full">
        {/* Chat Header Header */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-[var(--text-primary)]">Kinova AI Clinical Coach</h3>
              <span className="text-[9px] text-emerald-500 font-bold block">● ONLINE / ANALYSIS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-grow p-5 overflow-y-auto space-y-4 text-xs font-semibold leading-relaxed">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-700' : 'bg-brand-500'
              }`}>
                {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </div>
              <div className={`p-3.5 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-brand-500 text-white rounded-tr-none' 
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[8px] font-bold block pt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-white/60' : 'text-[var(--text-secondary)]'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-2.5"
        >
          <input 
            type="text" 
            placeholder="Type a clinical question (e.g. rotator cuff healing time)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button 
            type="submit"
            className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
