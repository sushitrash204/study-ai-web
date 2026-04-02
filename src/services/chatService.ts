import api from './api';
import { ChatHistoryItem, ChatResponse } from '../models/Chat';

export const chatWithAssistant = async (
    message: string,
    history: ChatHistoryItem[] = []
): Promise<ChatResponse> => {
    const response = await api.post('/chat', { message, history });
    return response.data;
};