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

/** 명세 §1.4 내 정보 조회 응답 result. (accessToken 미포함) */
export interface MemberMeResponse {
  memberId: number;
  email: string;
  name: string;
  profileUrl: string | null;
  type: 'USER' | 'ADMIN';
  createdAt: string;
}

export function mapMemberMeToUser(res: MemberMeResponse): User {
  return {
    id: String(res.memberId),
    memberId: res.memberId,
    name: res.name,
    email: res.email,
    type: res.type,
    profileUrl: res.profileUrl,
    plan: 'free',
  };
}

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
  /** 명세 §1.4: 서버에서 최신 내 정보를 다시 불러와 동기화. */
  refreshMe: () => Promise<void>;
  /** 명세 §1.3: 회원 탈퇴 후 로컬 세션 정리. */
  deleteAccount: () => Promise<void>;
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
