export interface ListBookDTO {
    id?: string;
    title: string;
    author: string;
    pages: number;
    description: string;
    coverUrl: string;
}

export interface SaveBookDTO {
    title: string;
    author: string;
    pages: number;
    description: string;
}

export interface UpdateBookDTO {
    title: string;
    author: string;
    pages: number;
    description: string;
}

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