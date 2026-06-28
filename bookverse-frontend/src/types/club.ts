export interface ListClubDto {
    id?: number;
    name: string;
    description: string;
    isPrivate: boolean;
}

export interface SaveClubDto {
    name: string;
    description: string;
    isPrivate: boolean;
}

export interface ClubMember {
    login: string;
    status: 'ACTIVE' | 'LEFT' | 'BANNED';
}

export interface ProgressViewDTO {
    id: number;
    username: string;
    bookTitle: string;
    clubId: number;
    currentPage: number;
    updatedAt: string;
}