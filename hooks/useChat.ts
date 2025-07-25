import { useState, useEffect, useCallback } from 'react';
import { Message, FileAttachment, MessageRole, MessagePart } from '../types';
import { getAiService } from '../services/geminiService';

const LOCAL_STORAGE_KEY = 'chatHistory';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiService = getAiService();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
        if(messages.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        }
    } catch (e) {
        console.error("Failed to save chat history to localStorage", e);
    }
  }, [messages]);

  const handleError = (errorMessage: string) => {
    const errorId = `error-${Date.now()}`;
    const errorMsg: Message = {
      id: errorId,
      role: MessageRole.ERROR,
      parts: [{ text: errorMessage }],
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, errorMsg]);
    setIsLoading(false);
  };

  const sendMessage = useCallback(async (text: string, files: FileAttachment[]) => {
    setIsLoading(true);
    setError(null);

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: MessageRole.USER,
      parts: [{ text }],
      attachments: files,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    const modelMessageId = `model-${Date.now()}`;
    const initialModelMessage: Message = {
        id: modelMessageId,
        role: MessageRole.MODEL,
        parts: [{ text: '' }],
        timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, initialModelMessage]);

    try {
        const apiParts: MessagePart[] = [];

        // Handle text part
        let combinedText = text;
        files.forEach(file => {
            if (file.type !== 'text/plain' && !file.type.startsWith('image/')) {
                combinedText += `\n[O usuário anexou o arquivo: ${file.name}]`;
            } else if (file.type === 'text/plain') {
                 combinedText += `\n\n--- Conteúdo do arquivo ${file.name} ---\n${file.content}`;
            }
        });
        if (combinedText.trim()) {
            apiParts.push({ text: combinedText.trim() });
        }

        // Handle image parts
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        for (const file of imageFiles) {
             // content is a data URL like "data:image/png;base64,iVBORw0KGgo..."
            const [header, base64Data] = file.content.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
            
            apiParts.push({
                inlineData: {
                    mimeType,
                    data: base64Data,
                }
            });
        }
        
        if (apiParts.length === 0) {
            handleError("Por favor, envie uma mensagem ou um arquivo.");
            return;
        }

        const stream = await aiService.sendMessageStream(apiParts);
        
        let fullResponse = '';
        for await (const chunkText of stream) {
            fullResponse += chunkText;

            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId 
                    ? { ...msg, parts: [{ text: fullResponse }] } 
                    : msg
            ));
        }
    } catch (e: any) {
      console.error("Error during message streaming:", e);
      handleError(e.message || "Ocorreu um erro desconhecido.");
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId)); // remove placeholder
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiService]);

  return { messages, isLoading, error, sendMessage };
};