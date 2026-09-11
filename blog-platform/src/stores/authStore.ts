import { create } from 'zustand'
import { API_BASE_URL } from '@/config/api'

type User = { id: string, email: string, name: string }
type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'
type AuthState = {
  currentUser: User | null
  authStatus: AuthStatus
  isLoading: boolean
  error: string | null
  setCurrentUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  fetchCurrentUser: () => Promise<boolean>
  updateProfile: (name?: string, email?: string) => Promise<boolean>
  logout: () => Promise<void>
};

// helper: fetch and error handling
async function authRequest<T>(
  url: string,
  options: RequestInit,
  defaultErrorMessage: string,
  set: (partial: Partial<AuthState>) => void,
) : Promise<T> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      let errorMessage = defaultErrorMessage
      try {
        const errorData = await response.json()
        if (errorData && typeof errorData.message === 'string' && errorData.message.trim() !== '') errorMessage = errorData.message
      } catch {
        // fallback to defaultErrorMessage
      }
      throw new Error(errorMessage)
    }
    const data = await response.json()
    return data as T
  } catch (error) {
    set({ error: error instanceof Error ? error.message : defaultErrorMessage })
    throw error
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  authStatus: 'checking',
  isLoading: false,
  error: null,
  setCurrentUser: (user) => set({ currentUser: user, authStatus: user ? 'authenticated' : 'unauthenticated' }),
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const tokens = await authRequest<{accessToken: string, refreshToken: string}>(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }, 'Login failed', set
      );
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      const success = await get().fetchCurrentUser()
      if (!success) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ currentUser: null, isLoading: false })
        return false
      }
      set({ isLoading: false })
      return true
    } catch (error) {
      set({
        currentUser: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed.'
      })
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return false
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      await authRequest(`${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        }, 'Register failed', set
      )
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Register failed.', isLoading: false })
      return false
    }
  },

  fetchCurrentUser: async () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      set({ currentUser: null, authStatus: 'unauthenticated' })
      return false
    }
    try {
      const user = await authRequest<User>(`${API_BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` }
        }, 'Failed to fetch current user', set
      )
      set({ currentUser: user, authStatus: 'authenticated' })
      return true
    } catch {
      set({ currentUser: null, authStatus: 'unauthenticated' })
      return false
    }
  },

  updateProfile: async (name, email) => {
    set({ isLoading: true, error: null })
    try {
      const currentUser = get().currentUser
      if (!currentUser) throw new Error('Must be logged in')
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) throw new Error('Must be logged in')
      const body: { name?: string, email?: string } = {}
      if (name !== undefined) body.name = name
      if (email !== undefined) body.email = email
      if (Object.keys(body).length === 0) throw new Error('At least 1 field is required')
      const result = await authRequest<{success: boolean, message: string, updatedUser: User}>(`${API_BASE_URL}/api/users/${currentUser.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(body)
        }, 'Failed to update profile', set
      )
      set({ currentUser: result.updatedUser, isLoading: false })
      return true
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update profile', isLoading: false })
      return false
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      }
    } catch {
      // network error
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ currentUser: null, authStatus: 'unauthenticated', error: null })
    }
  }
}))