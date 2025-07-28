
export interface User {
 username: string;
 password: string;
}

export interface AuthState {
  refresh_token: string | null
  accessToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  // role: string | null;
}


