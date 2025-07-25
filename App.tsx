import React, { useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
            <img src="https://iili.io/Fk07JQp.png" alt="Logo Ouvi.ai" className="w-14 h-14" />
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Ouvi.ai</h1>
                <p className="text-base text-slate-400">Assistente da Ouvidoria da Receita Federal</p>
            </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="sticky bottom-0">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;
