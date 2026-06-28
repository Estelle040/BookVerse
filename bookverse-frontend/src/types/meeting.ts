export interface MeetingViewDTO {
    id: number;
    title: string;
    description: string;
    location: string;
    meetingTime: string;
    status: 'PLANNED' | 'CANCELLED' | 'COMPLETED';
}

export interface UpdateMeetingDTO {
    title: string;
    description: string;
    location: string;
    meetingTime: string;
}

export interface CreateMeetingDTO {
    title: string;
    description: string;
    place: string;
    meetingDate: string;
}

export interface MeetingParticipantDTO {
    login: string;
    willAttend: boolean;
}