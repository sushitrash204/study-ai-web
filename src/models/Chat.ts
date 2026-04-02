export interface ChatHistoryItem {
    role: 'user' | 'assistant';
    text: string;
}

export interface ChatResponse {
    answer: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    createdAt?: Date;
}

export interface ActiveDocumentContext {
    id: string;
    title: string;
    summary: string;
}
