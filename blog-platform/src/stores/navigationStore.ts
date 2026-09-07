import { create } from 'zustand'
import type { View } from '@/types/view'

interface NavigationState {
    currentView: View
    navigate: (view: View) => void
    goHome: () => void
    goToPost: (postId: string) => void
    goToLogin: () => void
    goToRegister: () => void
    goToProfile: () => void
    goToCreatePost: () => void
    goToUpdatePost: (postId: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentView: { type: 'home' },
    navigate: (view) => { set({ currentView: view })},
    goHome: () => { set({ currentView: { type: 'home' }})},
    goToPost: (postId) => { set({ currentView: { type:'post-detail', postId }})},
    goToLogin: () => { set({ currentView: { type: 'login' }})},
    goToRegister: () => { set({ currentView: { type: 'register' }})},
    goToProfile: () => { set({ currentView: { type: 'profile' }})},
    goToCreatePost: () => { set({ currentView: { type: 'create-post' }})},
    goToUpdatePost: (postId) => { set({ currentView: { type: 'edit-post', postId }})}
}))