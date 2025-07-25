import React, { useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import { MessageRole } from './types';

const App: React.FC = () => {
  const { messages, isLoading, sendMessage, allChats, activeChatId, startNewChat, switchChat, deleteChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const WelcomeMessage = () => (
    <div className="text-center text-slate-400 mt-20">
      <img src="https://iili.io/Fk07JQp.png" alt="Logo Ouvi.ai" className="w-28 h-28 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-slate-200">Como posso ajudar hoje?</h2>
      <p className="mt-2">Envie uma mensagem ou anexe um documento para começar.</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      <Sidebar
        allChats={allChats}
        activeChatId={activeChatId}
        onNewChat={startNewChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 shrink-0 z-10">
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
            {messages.length === 0 && !isLoading ? (
              <WelcomeMessage />
            ) : (
               messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <footer className="sticky bottom-0 shrink-0">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </footer>
      </div>
    </div>
  );
};

export default App;
