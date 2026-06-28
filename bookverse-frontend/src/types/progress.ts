export interface ProgressViewDTO {
    id: number;
    username: string;
    bookTitle: string;
    clubId: number;
    currentPage: number;
    updatedAt: string;
}

export interface UpdateProgressDTO {
    clubId: number;
    bookId: string;
    currentPage: number;
}

// Расширенный тип с информацией о книге
export interface ProgressWithBook extends ProgressViewDTO {
    totalPages?: number;
    percentage?: number;
    author?: string;
    coverUrl?: string;
}