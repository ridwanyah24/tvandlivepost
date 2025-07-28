
export interface User {
 username: string;
 password: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  // role: string | null;
}


