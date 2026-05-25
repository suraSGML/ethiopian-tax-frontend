import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

      updateUser: (user) => set({ user }),

      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),

      updateTokens: (accessToken, refreshToken) => set({
        accessToken,
        ...(refreshToken && { refreshToken }),
      }),

      isRole: (role) => get().user?.role === role,
      isTaxpayer: () => get().user?.role === 'taxpayer',
      isTaxOfficer: () => ['tax_officer', 'super_admin'].includes(get().user?.role),
      isSuperAdmin: () => get().user?.role === 'super_admin',
    }),
    {
      name: 'eth-tax-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
