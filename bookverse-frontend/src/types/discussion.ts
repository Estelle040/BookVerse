export interface CreateThreadDTO {
    clubId: number;
    bookId: string;
    title: string;
}

export interface ThreadResponseDTO {
    id: number;
    title: string;
    bookTitle: string;
    createdAt: string;
}

export interface MessageDTO {
    threadId: number;
    message: string;
}

export interface MessageResponseDTO {
    username: string;
    message: string;
    createdAt: string;
}