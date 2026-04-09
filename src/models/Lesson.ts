export class LessonModel {
    id: string;
    title: string;
    description?: string;
    contentStyle: 'BLOCKS' | 'HTML';
    content?: any;
    order: number;
    subjectId: string;
    userId: string;
    status: 'DRAFT' | 'PUBLIC';
    createdAt?: string;

    // Optional included data
    subject?: { name: string; color: string; classId?: string; class?: { name: string }; isSystem?: boolean };

    constructor(data: any) {
        this.id = data?.id || '';
        this.title = data?.title || '';
        this.description = data?.description;
        this.contentStyle = data?.contentStyle || 'BLOCKS';
        this.content = data?.content;
        this.order = data?.order || 0;
        this.subjectId = data?.subjectId || '';
        this.userId = data?.userId || '';
        this.status = data?.status || 'DRAFT';
        this.createdAt = data?.createdAt;
        this.subject = data?.subject;
    }

    isPublished(): boolean {
        return this.status === 'PUBLIC';
    }

    getStatusLabel(): string {
        return this.status === 'PUBLIC' ? 'Đã công khai' : 'Bản nháp';
    }

    getFormattedDate(): string {
        if (!this.createdAt) return 'Chưa có thông tin';
        return new Date(this.createdAt).toLocaleDateString('vi-VN');
    }
}
