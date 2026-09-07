import { create } from 'zustand'
import type { Post } from '@/types/post'
import { API_BASE_URL } from '@/config/api'

type PostsResponse = {
    success: boolean,
    data: Post[],
    pagination: { page: number, limit: number, total: number, totalPages: number }
}

type CreatePostResponse = { success: boolean, message: string, data: Post }

type UpdatePostResponse = { success: boolean, message: string, post: Post }

type BlogState = {
    posts: Post[],
    selectedPost: Post | null,
    isLoading: boolean,
    error: string | null,
    controller: AbortController | null,
    setPosts: (post: Post[]) => void,
    setselectedPost: (post: Post | null) => void,
    selectPost: (postId: string) => void,
    setIsLoading: (isLoading: boolean) => void,
    fetchPosts: (search?: string) => Promise<void>,
    createPost: (title: string, content: string) => Promise<boolean>,
    updatePost: (id: string, title: string, content: string) => Promise<boolean>,
    deletePost: (id: string) => Promise<boolean>,
}

export const useBlogStore = create<BlogState>((set, get) => ({
    posts: [],
    selectedPost: null,
    isLoading: false,
    error: null,
    controller: null,
    setPosts: (posts) => set({ posts }),
    setselectedPost: (post) => set({ selectedPost: post }),
    selectPost: (postId) => {
        const post = get().posts.find((post) => post.id === postId)
        set({ selectedPost: post ?? null })
    },
    setIsLoading: (isLoading) => set({ isLoading: isLoading }),
    fetchPosts: async (search) => {
        // abort old request before start new request
        get().controller?.abort()
        const controller = new AbortController()
        set({ controller, isLoading: true, error: null })
        try {
            const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
            const response = await fetch(`${API_BASE_URL}/api/posts/${query}`, { signal: controller.signal })
            if (!response.ok) throw new Error('Failed to fetch')
            const result: PostsResponse = await response.json()
            set({ posts: result.data })
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return
            set({ error: error instanceof Error ? error.message : 'Unknown error' })
        } finally {
            // only current request can disable loading
            if (get().controller === controller) { set({ isLoading: false, controller: null }) }
        }
    },
    createPost: async (title, content) => {
        set({ isLoading: true, error: null })
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/posts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ title, content })
            })
            if (!response.ok) {
                let errorMessage = 'Failed to create post'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') errorMessage = errorData.message
                } catch {
                    // fallback to default errorMessage
                }
                throw new Error(errorMessage)
            }
            const result: CreatePostResponse = await response.json()
            const newPost = result.data
            set((state) => ({ posts: [newPost, ...state.posts], isLoading: false }))
            return true
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create post', isLoading: false })
            return false
        }
    },
    updatePost: async (id, title, content) => {
        set({ isLoading: true, error: null })
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ title, content })
            })
            if (!response.ok) {
                let errorMessage = 'Failed to update post'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') errorMessage = errorData.message
                } catch {
                    // fallback to default errorMessage
                }
                throw new Error(errorMessage)
            }
            const result: UpdatePostResponse = await response.json()
            const updatedPost = result.post
            set((state) => ({
                posts: state.posts.map((post) => post.id === id ? updatedPost : post),
                selectedPost: state.selectedPost?.id === id ? updatedPost : state.selectedPost,
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update post', isLoading: false })
            return false
        }
    },
    deletePost: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (!response.ok) {
                let errorMessage = 'Failed to delete post'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') errorMessage = errorData.message
                } catch {
                    // fallback to default errorMessage
                }
                throw new Error(errorMessage)
            }
            set((state) => ({
                posts: state.posts.filter((post) => post.id !== id),
                selectedPost: state.selectedPost?.id === id ? null : state.selectedPost,
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete post', isLoading: false })
            return false
        }
    }
}))