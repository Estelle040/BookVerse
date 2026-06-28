export interface StartVote {
    name: string;
    start: string;
    end: string;
    club_name: string;
    description: string;
}

export interface ShortVoteDTO {
    id?: number;
    name: string;
    description: string;
    optionList: string[];
    start: string;
    end: string;
    status?: 'WAITING' | 'ACTIVE' | 'FINISHED';
}

export interface VotedBookDTO {
    vote_name: string;
    book_name: string;
}

export interface OptionResult {
    bookTitle: string;
    score: number;
}

export interface VoteResultDTO {
    voteTitle: string;
    results: OptionResult[];
}

export interface ShortVoteDTO {
    id?: number;
    name: string;
    description: string;
    optionList: string[];
    start: string;
    end: string;
    status?: 'WAITING' | 'ACTIVE' | 'FINISHED';
}