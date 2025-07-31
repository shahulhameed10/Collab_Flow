import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//use zustand to store and share user,authstate
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void; 
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      user: null,
      hasHydrated: false,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      
      //Logout implementation
      logout: () =>
        set({
          accessToken: null,
          user: null,
        }),
    }),
    {
      //check whether the state is stored and restored in ls
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
