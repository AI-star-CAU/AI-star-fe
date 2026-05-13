export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  memberId?: number;
  name: string;
  email: string;
  type?: 'USER' | 'ADMIN';
  profileUrl?: string | null;
  plan: 'free' | 'pro';
}

export interface AuthResponse {
  memberId: number;
  email: string;
  name: string;
  type: 'USER' | 'ADMIN';
  profileUrl: string | null;
  accessToken: string;
}

export type SignupResponse = AuthResponse;

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE'; user: User | null };

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
}

export function mapAuthResponseToUser(response: AuthResponse): User {
  return {
    id: String(response.memberId),
    memberId: response.memberId,
    name: response.name,
    email: response.email,
    type: response.type,
    profileUrl: response.profileUrl,
    plan: 'free',
  };
}
