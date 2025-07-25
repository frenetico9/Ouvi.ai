
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { FileAttachment } from '../types';
import { PaperclipIcon, SendIcon, CloseIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, files: FileAttachment[]) => void;
  isLoading: boolean;
}

const MAX_FILES = 5;

// Helper to read file content
const readFileContent = (file: File): Promise<FileAttachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file.'));
      }
      resolve({
        name: file.name,
        type: file.type,
        content: reader.result,
      });
    };
    reader.onerror = reject;

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
        // For unsupported files, we just use the name
        resolve({
            name: file.name,
            type: file.type,
            content: `Arquivo com nome "${file.name}" foi anexado.`,
        });
    }
  });
};


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if ((!text.trim() && files.length === 0) || isLoading) return;
    onSendMessage(text, files);
    setText('');
    setFiles([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files).slice(0, MAX_FILES - files.length);

    try {
        const processedFiles = await Promise.all(selectedFiles.map(readFileContent));
        setFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
        console.error("Error reading files:", error);
        // Here you could set an error state to show in the UI
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-slate-800 p-4 border-t border-slate-700">
      <div className="max-w-3xl mx-auto">
        {files.length > 0 && (
          <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative bg-slate-700 rounded-lg p-2 text-xs">
                <button 
                  onClick={() => removeFile(index)} 
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  aria-label="Remove file"
                >
                  <CloseIcon className="w-3 h-3"/>
                </button>
                 {file.type.startsWith('image/') ? (
                    <img src={file.content} alt={file.name} className="rounded-md object-cover h-16 w-full" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-16 text-center">
                        <p className="font-bold text-slate-300 uppercase">{file.name.split('.').pop()}</p>
                    </div>
                )}
                <p className="text-slate-400 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center bg-slate-700 rounded-xl p-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label="Attach file"
            disabled={files.length >= MAX_FILES}
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.txt"
            className="hidden"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua dúvida ou anexe um documento/imagem para análise..."
            className="flex-grow bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none px-3"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={(!text.trim() && files.length === 0) || isLoading}
            className="p-2 rounded-lg bg-blue-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>
            ) : (
                <SendIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;