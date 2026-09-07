import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBlogStore } from '@/stores/blogStore'
import { useComments } from '@/hooks/useComments'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CommentItem } from '@/components/CommentItem'

interface PostDetailProps { postId: string }

interface CommentFormValues { content: string }

export function PostDetailPage({ postId }: PostDetailProps) {
    const selectedPost = useBlogStore((state) => state.posts.find((post) => post.id === postId))
    const currentUser = useAuthStore((state) => state.currentUser)
    const deletePost = useBlogStore((state) => state.deletePost)
    const deleteError = useBlogStore((state) => state.error)
    const goHome = useNavigationStore((state) => state.goHome)
    const goToUpdatePost = useNavigationStore((state) => state.goToUpdatePost)
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const { comments, loading, error, addComment, updateComment, deleteComment, isSubmitting, submitError } = useComments(postId)
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>({ defaultValues: { content: '' } })
    async function onSubmit({ content }: CommentFormValues) {
        const success = await addComment(content)
        if (success) reset()
    }
    async function handleDelete() {
        const success = await deletePost(postId)
        if (success) goHome()
    }
    if (!selectedPost) {
        return (
            <main className='container mx-auto px-4 py-8'>
                <p>Post not found</p>
            </main>
        )
    }
    return (
        <main className='container mx-auto px-4 py-8'>
            <article>
                <div className='flex items-center gap-4'>
                    <h1 className='text-3xl font-bold'>{selectedPost.title}</h1>
                    {currentUser?.id === selectedPost.author.id && (
                        <div>
                            <div className='flex items-center gap-2'>
                                <Button type='button' onClick={() => goToUpdatePost(postId)}>Edit</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type='button' variant='destructive'>Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete post?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            {deleteError && <p className='text-sm'>{deleteError}</p>}
                        </div>
                    )}
                </div>
                <p className='mt-2 text-sm'>Author: {selectedPost.author.name}</p>
                <p className='mt-2 text-sm'>Posted on: {selectedPost.createdAt}</p>
                <div className='mt-6 whitespace-break-spaces'>{selectedPost.content}</div>
            </article>
            <section className='mt-10'>
                <h2 className='text-xl font-semibold'>Comments</h2>
                {loading && <p>Loading comments...</p>}
                {error && <p>Error: {error}</p>}
                {!loading && !error && (
                    comments.length === 0 ? (
                        <p>No comments yet</p>
                    ) : (
                        <ul className='mt-6 space-y-4'>
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={currentUser?.id}
                                    isEditing={comment.id === editingCommentId}
                                    isSubmitting={isSubmitting}
                                    onStartEdit={setEditingCommentId}
                                    onCancelEdit={() => setEditingCommentId(null)}
                                    onUpdate={updateComment}
                                    onDelete={deleteComment}
                                />
                            ))}
                        </ul>
                    )
                )}
                {currentUser ? (
                    <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
                        <Textarea {...register('content', { required: 'Content is required' })} placeholder='Write a comment here...' rows={3} disabled={isSubmitting} />
                        <Button type='submit' disabled={isSubmitting} className='mt-2 rounded px-4 py-2'>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
                        {submitError && <p className='mt-2 text-sm'>{submitError}</p>}
                        {errors.content && <p className='mt-2 text-sm'>{errors.content.message}</p>}
                    </form>
                ) : (
                    <p className='mt-4 font-semibold'>You must log in to comment</p>
                )}
            </section>
        </main>
    )
}