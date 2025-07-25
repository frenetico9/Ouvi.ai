import React from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const isModel = message.role === MessageRole.MODEL;
  const isError = message.role === MessageRole.ERROR;

  const textContent = message.parts.map(p => p.text).join('');

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    return (
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {message.attachments.map((file, index) => (
          <div key={index} className="bg-slate-600/50 rounded-lg p-2 text-xs break-all">
            {file.type.startsWith('image/') ? (
              <img src={file.content} alt={file.name} className="rounded-md object-cover h-24 w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-24">
                <p className="font-bold text-slate-300">TXT</p>
              </div>
            )}
            <p className="text-slate-400 mt-1 truncate">{file.name}</p>
          </div>
        ))}
      </div>
    );
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center my-4">
        <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg max-w-3xl">
          <p className="font-bold">Erro</p>
          <p>{textContent}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <img src="https://iili.io/Fk07JQp.png" alt="Logo Ouvi.ai" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`max-w-2xl w-full ${isUser ? 'order-1 text-right' : 'order-2'}`}>
        <div className={`inline-block px-5 py-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
          <div className="text-left">
            {isModel && textContent.length === 0 ? (
                <div className="flex items-center gap-2">
                    <span className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span className="animate-pulse delay-75 w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span className="animate-pulse delay-150 w-2 h-2 bg-cyan-400 rounded-full"></span>
                </div>
            ) : (
               <MarkdownRenderer content={textContent} />
            )}
            {renderAttachments()}
          </div>
        </div>
        <p className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center order-2">
          <UserIcon className="w-6 h-6 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;