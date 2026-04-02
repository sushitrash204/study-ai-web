import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Exercise } from '../../models/Exercise';

interface LifecycleState {
    questions: any[];
    userAnswers: Record<string, any>;
    essayAnswers: Record<string, any>;
}

interface LifecycleActions {
    submit: () => Promise<any>;
    resetSession: () => void;
    setSubmitted: (val: boolean) => void;
    setExercise: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * A hook to manage the lifecycle transitions of an exercise session:
 * Submitting with confirmation, retrying, and deleting.
 * This removes large Alert-based logic from the screen component.
 */
export const useExerciseLifecycle = (
    exercise: Exercise | null,
    navigation: NativeStackNavigationProp<any>,
    state: LifecycleState,
    actions: LifecycleActions,
    exActions: any // From useExercise()
) => {
    const { questions, userAnswers, essayAnswers } = state;

    const handleSubmitConfirm = async (onSuccess?: (result: any) => void) => {
        if (!exercise) return;
        
        const unanswered = questions.filter(q => {
            if (q.type === 'ESSAY') return !(essayAnswers[q.id] || '').trim();
            return !userAnswers[q.id];
        });

        const performSubmit = async () => {
            const result = await actions.submit();
            if (result && onSuccess) {
                onSuccess(result);
            }
        };

        if (unanswered.length > 0) {
            Alert.alert(
                'Chưa hoàn thành',
                `Còn ${unanswered.length} câu chưa trả lời. Bạn có muốn nộp không?`,
                [
                    { text: 'Tiếp tục làm', style: 'cancel' },
                    { text: 'Nộp bài', onPress: performSubmit },
                ]
            );
        } else {
            performSubmit();
        }
    };

    const handleRetry = (randomizeFn: (qs: any[]) => any[]) => {
        if (exercise?.type === 'QUIZ') {
            actions.resetSession();
            // Parent should handle randomization via setExercise
            actions.setExercise((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    questions: randomizeFn(prev.questions ?? [])
                };
            });
        } else {
            actions.resetSession();
        }
    };

    const handleDelete = async () => {
        if (!exercise) return;
        const success = await exActions.handleDeleteExercise(exercise);
        if (success) {
            navigation.goBack();
        }
    };

    const openActionSheet = (randomizeFn: (qs: any[]) => any[]) => {
        const items: Array<{ text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }> = [
            { text: 'Làm lại', onPress: () => handleRetry(randomizeFn) },
            { text: 'Xóa bộ đề', style: 'destructive', onPress: handleDelete },
            { text: 'Hủy', style: 'cancel' }
        ];

        Alert.alert('Tùy chọn bộ đề', 'Bạn muốn thực hiện thao tác nào?', items);
    };

    return {
        handleSubmitConfirm,
        handleRetry,
        handleDelete,
        openActionSheet
    };
};
