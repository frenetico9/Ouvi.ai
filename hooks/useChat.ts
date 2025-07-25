
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Message, FileAttachment, MessageRole } from '../types';
import { getAiService } from '../services/geminiService';

const LOCAL_STORAGE_KEY = 'ouviAiMultiChat';

interface StoredChats {
    chats: { [id: string]: Message[] };
    activeChatId: string | null;
}

export const useChat = () => {
    const [allChats, setAllChats] = useState<{ [id: string]: Message[] }>({});
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const aiService = getAiService();

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                const { chats, activeChatId: storedActiveId }: StoredChats = JSON.parse(storedData);
                setAllChats(chats);
                setActiveChatId(storedActiveId);
            } else {
                // Start with a new chat if no history exists
                startNewChat();
            }
        } catch (e) {
            console.error("Failed to load chat history from localStorage", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            startNewChat();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on initial mount

    useEffect(() => {
        try {
            if (Object.keys(allChats).length > 0 || activeChatId) {
                const dataToStore: StoredChats = { chats: allChats, activeChatId };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
            }
        } catch (e) {
            console.error("Failed to save chat history to localStorage", e);
        }
    }, [allChats, activeChatId]);

    const messages = useMemo(() => (activeChatId && allChats[activeChatId]) ? allChats[activeChatId] : [], [allChats, activeChatId]);

    const handleError = (errorMessage: string, chatId: string) => {
        const errorId = `error-${Date.now()}`;
        const errorMsg: Message = {
            id: errorId,
            role: MessageRole.ERROR,
            parts: [{ text: errorMessage }],
            timestamp: new Date().toISOString(),
        };
        setAllChats(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), errorMsg]
        }));
        setIsLoading(false);
    };
    
    const startNewChat = useCallback(() => {
        const newId = `chat-${Date.now()}`;
        setAllChats(prev => ({ ...prev, [newId]: [] }));
        setActiveChatId(newId);
    }, []);

    const switchChat = useCallback((chatId: string) => {
        if (allChats[chatId]) {
            setActiveChatId(chatId);
        }
    }, [allChats]);
    
    const deleteChat = useCallback((chatId: string) => {
        setAllChats(prev => {
            const newChats = { ...prev };
            delete newChats[chatId];
            return newChats;
        });

        if (activeChatId === chatId) {
            const remainingIds = Object.keys(allChats).filter(id => id !== chatId);
            const sortedRemainingIds = remainingIds.sort((a, b) => b[0].localeCompare(a));
            
            if (sortedRemainingIds.length > 0) {
                setActiveChatId(sortedRemainingIds[0]);
            } else {
                startNewChat();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChatId, allChats]);


    const sendMessage = useCallback(async (text: string, files: FileAttachment[]) => {
        let currentChatId = activeChatId;

        if (!currentChatId) {
            const newId = `chat-${Date.now()}`;
            setAllChats(prev => ({ ...prev, [newId]: [] }));
            setActiveChatId(newId);
            currentChatId = newId;
        }
        
        if (!text.trim() && files.length === 0) {
            return; // Don't send empty messages
        }

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
        
        const modelMessageId = `model-${Date.now()}`;
        const initialModelMessage: Message = {
            id: modelMessageId,
            role: MessageRole.MODEL,
            parts: [{ text: '' }],
            timestamp: new Date().toISOString(),
        };
        
        const historyForAPI = [...(allChats[currentChatId] || []), userMessage];
        
        setAllChats(prev => ({
            ...prev,
            [currentChatId!]: [...historyForAPI, initialModelMessage]
        }));

        try {
            const stream = await aiService.sendMessageStream(historyForAPI);
            
            let fullResponse = '';
            for await (const chunkText of stream) {
                fullResponse += chunkText;
                setAllChats(prev => {
                    const updatedChat = prev[currentChatId!].map(msg => 
                        msg.id === modelMessageId 
                            ? { ...msg, parts: [{ text: fullResponse }] } 
                            : msg
                    );
                    return { ...prev, [currentChatId!]: updatedChat };
                });
            }
        } catch (e: any) {
            console.error("Error during message streaming:", e);
            handleError(e.message || "Ocorreu um erro desconhecido.", currentChatId!);
            setAllChats(prev => {
                const updatedChat = prev[currentChatId!].filter(msg => msg.id !== modelMessageId);
                return { ...prev, [currentChatId!]: updatedChat };
            });
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiService, activeChatId, allChats]);

    return { messages, allChats, activeChatId, isLoading, error, sendMessage, startNewChat, switchChat, deleteChat };
};
