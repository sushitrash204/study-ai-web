import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from './useChat';
import { useSubjects } from '../subject/useSubjects';
import { useDocuments } from '../documents/useDocuments';

interface ChatRouteParams {
    summaryDocumentId?: string;
    summaryTitle?: string;
    summaryRequestId?: string;
}

export const useChatSession = (routeParams: ChatRouteParams) => {
    const [message, setMessage] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [activatingDocumentId, setActivatingDocumentId] = useState<string | null>(null);

    const { state: chatState, actions: chatActions } = useChat();
    const { messages, activeDocument, isSummarizing, isReplying } = chatState;
    
    // Default hooks stay idle until manual fetch
    const { state: { subjects, isLoading: loadingSubjects }, actions: subjectActions } = useSubjects();
    const { state: { documents, isLoading: loadingDocuments }, actions: documentActions } = useDocuments();

    const handledRequestRef = useRef<string | null>(null);

    const subjectDocuments = selectedSubjectId ? documents.filter(d => d.subjectId === selectedSubjectId) : [];
    const pdfDocuments = subjectDocuments.filter(d => (d.fileType || '').toLowerCase() === 'pdf');

    const openDocumentPicker = async () => {
        setPickerVisible(true);
        await subjectActions.fetchAll();
        await documentActions.fetchDocuments(true);

        if (!selectedSubjectId && subjects.length > 0) {
            setSelectedSubjectId(subjects[0].id);
        }
    };

    const activateDocumentContext = useCallback(async (
        documentId: string,
        title: string,
        source: 'route' | 'picker' = 'picker'
    ) => {
        if (source === 'picker') {
            setPickerVisible(false);
        }

        setActivatingDocumentId(documentId);
        await chatActions.activateDocumentContext(documentId, title);
        setActivatingDocumentId(null);
    }, [chatActions]);

    useEffect(() => {
        const requestId = routeParams.summaryRequestId;
        const documentId = routeParams.summaryDocumentId;
        const title = routeParams.summaryTitle || 'Tài liệu PDF';

        if (!requestId || !documentId || handledRequestRef.current === requestId) {
            return;
        }

        handledRequestRef.current = requestId;
        // Route-driven activation needs to happen after mount when params are available.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        activateDocumentContext(documentId, title, 'route');
    }, [routeParams, activateDocumentContext]);

    const clearDocumentContext = useCallback(() => {
        chatActions.clearDocumentContext();
    }, [chatActions]);

    const openContextMenu = useCallback(() => {
        if (!activeDocument) {
            openDocumentPicker();
            return;
        }
        
        // Simplified menu for web using standard confirm or just toggling picker
        const choice = window.confirm(`Đang dùng tài liệu "${activeDocument.title}". Bạn có muốn chọn tài liệu khác không?\n\n(Bấm 'Cancel' để ngừng chat theo tài liệu này)`);
        
        if (choice) {
            openDocumentPicker();
        } else {
            const clear = window.confirm('Bạn có muốn ngừng chat theo tài liệu và quay về trò chuyện chung không?');
            if (clear) clearDocumentContext();
        }
    }, [activeDocument, openDocumentPicker, clearDocumentContext]);

    const startNewChat = useCallback(() => {
        if (messages.length === 0 && !activeDocument) return;
        handledRequestRef.current = null;
        chatActions.startNewChat();
    }, [messages.length, activeDocument, chatActions]);

    const sendMessage = useCallback(async () => {
        const trimmed = message.trim();
        if (!trimmed || isSummarizing || isReplying) return;
        
        setMessage('');        
        await chatActions.sendMessage(trimmed);
    }, [message, isSummarizing, isReplying, chatActions]);

    return {
        state: {
            message,
            pickerVisible,
            selectedSubjectId,
            activatingDocumentId,
            messages,
            activeDocument,
            isSummarizing,
            isReplying,
            subjects,
            loadingSubjects,
            documents,
            loadingDocuments,
            pdfDocuments,
        },
        actions: {
            setMessage,
            setPickerVisible,
            setSelectedSubjectId,
            openDocumentPicker,
            activateDocumentContext,
            clearDocumentContext,
            openContextMenu,
            startNewChat,
            sendMessage,
        }
    };
};
