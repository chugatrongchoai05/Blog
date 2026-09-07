import { useForm } from 'react-hook-form'
import { useBlogStore } from '@/stores/blogStore'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EditPostPageProps { postId: string }

type EditPostData = { title: string, content: string }

export function EditPostPage({ postId }: EditPostPageProps) {
    const selectedPost = useBlogStore((state) => state.posts.find((post) => post.id === postId))
    const currentUser = useAuthStore((state) => state.currentUser)
    const updatePost = useBlogStore((state) => state.updatePost)
    const isLoading = useBlogStore((state) => state.isLoading)
    const error = useBlogStore((state) => state.error)
    const goToPost = useNavigationStore((state) => state.goToPost)
    const { register, handleSubmit, formState: { errors } } = useForm<EditPostData>({
        defaultValues: {
            title: selectedPost?.title ?? '',
            content: selectedPost?.content ?? '',
        }
    })
    const onSubmit = async (data: EditPostData) => {
        const success = await updatePost(postId, data.title, data.content)
        if (success) goToPost(postId)
    }
    if (!selectedPost) return (
        <main className='container mx-auto px-4 py-8'>
            <p>Post not found</p>
        </main>
    )
    if (selectedPost.author.id !== currentUser?.id) return (
        <main className='container mx-auto px-4 py-8'>
            <p>You can only update your own post.</p>
        </main>
    )
    return (
        <main className='mx-auto w-full max-w-2xl px-4 py-8'>
            <h1 className='mb-6 text-2xl font-bold'>Edit post</h1>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input id='title' {...register('title', { required: 'Title is required' })} disabled={isLoading}/>
                    {errors.title && <p className='text-sm'>{errors.title.message}</p>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='content'>Content</Label>
                    <Textarea id='content' rows={10} {...register('content', { required: 'Content is required' })} disabled={isLoading}/>
                    {errors.content && <p className='text-sm'>{errors.content.message}</p>}
                </div>
                {error && <p className='text-sm'>{error}</p>}
                <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save changes'}
                </Button>
            </form>
        </main>
    )
}