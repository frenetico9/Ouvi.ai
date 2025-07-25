import React from 'react';
import { Message, MessageRole } from '../types';
import { PlusCircleIcon, TrashIcon, MessageIcon } from './Icons';

interface SidebarProps {
  allChats: { [id: string]: Message[] };
  activeChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ allChats, activeChatId, onNewChat, onSwitchChat, onDeleteChat }) => {
  const getChatTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.role === MessageRole.USER);
    const text = firstUserMessage?.parts?.find(p => p.text)?.text;
    if (text) {
      return text.substring(0, 35) + (text.length > 35 ? '...' : '');
    }
    return 'Novo Chat';
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent switching to the chat when deleting
    if (window.confirm('Tem certeza que deseja apagar este chat? Esta ação não pode ser desfeita.')) {
      onDeleteChat(chatId);
    }
  };

  const sortedChats = Object.entries(allChats).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="w-72 bg-slate-800 flex flex-col h-full border-r border-slate-700 shrink-0">
      <div className="p-4 border-b border-slate-700">
        <button 
          onClick={onNewChat} 
          className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Novo Chat
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedChats.map(([chatId, messages]) => (
          <button
            key={chatId}
            onClick={() => onSwitchChat(chatId)}
            className={`flex items-center w-full text-left p-2.5 rounded-md transition-colors text-sm group ${
              activeChatId === chatId ? 'bg-slate-700' : 'hover:bg-slate-700/50'
            }`}
          >
            <MessageIcon className="w-4 h-4 mr-3 flex-shrink-0 text-slate-400" />
            <span className="flex-grow truncate text-slate-300">{getChatTitle(messages)}</span>
            <button 
              onClick={(e) => handleDelete(e, chatId)} 
              className="ml-2 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Apagar chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
