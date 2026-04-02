export class Subject {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;

    constructor(data: any) {
        this.id = data?.id || '';
        this.name = data?.name || '';
        this.color = data?.color || '#000000';
        this.userId = data?.userId || '';
        this.createdAt = data?.createdAt;
        this.updatedAt = data?.updatedAt;
    }
    getFormattedCreatedAt(): string {
        if (!this.createdAt) return 'Chưa có thông tin';
        return new Date(this.createdAt).toLocaleDateString('vi-VN');
    }
}
