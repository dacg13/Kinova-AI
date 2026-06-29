import React, { useState } from 'react';
import { Send, Search, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export const Messages: React.FC = () => {
  const { user } = useAuth();
  console.log('Active messages viewer:', user?.name);

  const contacts: Contact[] = [
    { id: '1', name: 'Robert, DPT', role: 'Physical Therapist', lastMessage: 'Great progress on your shoulder ROM yesterday.', time: '14:22', unread: true },
    { id: '2', name: 'Family Caregiver', role: 'Caretaker', lastMessage: 'Did you complete your daily squat sets yet?', time: 'Yesterday', unread: false },
    { id: '3', name: 'AI Kinova Bot', role: 'Clinical Coach', lastMessage: 'Knee valgus checked: Try pressing outward.', time: 'June 25', unread: false }
  ];

  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [inputText, setInputText] = useState('');
  const [chatLogs, setChatLogs] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    '1': [
      { sender: 'therapist', text: 'Hi Dhruv, I reviewed your shoulder abduction telemetry logs. Your peak extension hit 132° which is excellent!', time: '14:20' },
      { sender: 'user', text: 'Thanks Dr. Robert! The real-time speech cue really helps me align my shoulder joint.', time: '14:21' },
      { sender: 'therapist', text: 'Great progress on your shoulder ROM yesterday. Keep up the pacing of 4 seconds per rep.', time: '14:22' }
    ],
    '2': [
      { sender: 'caregiver', text: 'Did you complete your daily squat sets yet?', time: 'Yesterday' }
    ],
    '3': [
      { sender: 'bot', text: 'Knee valgus checked: Try pressing outward.', time: 'June 25' }
    ]
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));

    setInputText('');
  };

  const activeLogs = chatLogs[activeContact.id] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar contact lists */}
      <div className="glass-card rounded-2xl p-4 border border-[var(--border-color)] space-y-4 lg:col-span-1 flex flex-col overflow-hidden h-full bg-slate-900/10">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex-grow space-y-2 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                activeContact.id === contact.id 
                  ? 'border-brand-500 bg-brand-500/5' 
                  : 'border-slate-850 hover:bg-slate-500/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-xs text-[var(--text-primary)]">{contact.name}</span>
                <span className="text-[8px] text-[var(--text-secondary)] font-bold">{contact.time}</span>
              </div>
              <div className="text-[9px] text-brand-500 font-bold pt-0.5">{contact.role}</div>
              <p className="text-[9px] text-[var(--text-secondary)] truncate pt-1 leading-normal font-semibold">
                {contact.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat logs and inputs */}
      <div className="lg:col-span-3 glass-card rounded-2xl border border-[var(--border-color)] flex flex-col overflow-hidden h-full">
        {/* Active Contact Header */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
            <User className="h-4 w-4 text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{activeContact.name}</h3>
            <span className="text-[9px] text-brand-500 font-bold block">{activeContact.role}</span>
          </div>
        </div>

        {/* Message logs logs */}
        <div className="flex-grow p-5 overflow-y-auto space-y-4 text-xs font-semibold leading-relaxed">
          {activeLogs.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={idx} className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                  isUser ? 'bg-slate-700' : 'bg-brand-500'
                }`}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className={`p-3.5 rounded-2xl ${
                  isUser 
                    ? 'bg-brand-500 text-white rounded-tr-none' 
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[8px] font-bold block pt-1.5 text-right ${
                    isUser ? 'text-white/60' : 'text-[var(--text-secondary)]'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-2.5">
          <input 
            type="text" 
            placeholder={`Message ${activeContact.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
