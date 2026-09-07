import { useState, useEffect } from 'react'
import type { Comment } from '@/types/comment'
import { API_BASE_URL } from '@/config/api'

type CommentsResponse = { success: boolean, count: number, data: Comment[] }

type CreateCommentResponse = { success: boolean, message: string, data: Comment }

type UpdateCommentResponse = { success: boolean, message: string, comment: Comment }

export function useComments(postId: string | undefined) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    useEffect(() => {
        if (!postId) return
        const controller = new AbortController()
        async function fetchComments() {
            setLoading(true)
            setError(null)
            setComments([])
            try {
                const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, { signal: controller.signal })
                if (!response.ok) {
                    let message = 'Failed to fetch comments'
                    try {
                        const errorData = await response.json()
                        if (typeof errorData.message === 'string') message = errorData.message
                    } catch {
                        // fallback to message
                    }
                    throw new Error(message)
                }
                const data: CommentsResponse = await response.json()
                setComments(data.data)
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return
                if (error instanceof Error) {
                    setError(error.message)
                } else {
                    setError('Unknown error.')
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }
        fetchComments()
        return() => { controller.abort() }
    }, [postId])
    async function addComment(content: string): Promise<boolean> {
        if (!postId) return false
        setIsSubmitting(true) 
        setSubmitError(null)
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ content })
            })
            if (!response.ok) {
                let message = 'Failed to add comment'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') message = errorData.message
                } catch {
                    // fallback to message
                }
                throw new Error(message)
            }
            const result: CreateCommentResponse = await response.json()
            const newComment = result.data
            setComments((prev) => [newComment, ...prev])
            setIsSubmitting(false)
            return true
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to add comment')
            setIsSubmitting(false)
            return false
        }
    }
    async function updateComment(commentId: string, content: string): Promise<boolean> {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ content })
            })
            if (!response.ok) {
                let message = 'Failed to update comment'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') message = errorData.message
                } catch {
                    // fallback to message
                }
                throw new Error(message)
            }
            const result: UpdateCommentResponse = await response.json()
            const updatedComment = result.comment
            setComments((prev) => prev.map((comment) => comment.id === commentId ? updatedComment : comment))
            setIsSubmitting(false)
            return true
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to update comment')
            setIsSubmitting(false)
            return false
        }
    }
    async function deleteComment(commentId: string): Promise<boolean> {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) throw new Error('Must be logged in')
            const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (!response.ok) {
                let message = 'Failed to delete comment'
                try {
                    const errorData = await response.json()
                    if (typeof errorData.message === 'string') message = errorData.message
                } catch {
                    // fallback to message
                }
                throw new Error(message)
            }
            setComments((prev) => prev.filter((comment) => comment.id !== commentId))
            setIsSubmitting(false)
            return true
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to delete comment')
            setIsSubmitting(false)
            return false
        }
    }
    return { comments, loading, error, addComment, isSubmitting, submitError, updateComment, deleteComment }
}