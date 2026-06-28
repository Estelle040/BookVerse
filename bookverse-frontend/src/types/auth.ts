export interface LoginRequest {
    login: string;
    password: string;
}

export interface RegisterRequest {
    login: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    token: string;
}