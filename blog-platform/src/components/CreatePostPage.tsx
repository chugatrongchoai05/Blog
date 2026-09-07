import { useForm } from 'react-hook-form'
import { useBlogStore } from '@/stores/blogStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CreatePostData = { title: string, content: string }

export function CreatePostPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<CreatePostData>()
    const createPost = useBlogStore((state) => state.createPost)
    const isLoading = useBlogStore((state) => state.isLoading)
    const error = useBlogStore((state) => state.error)
    const goHome = useNavigationStore((state) => state.goHome)
    const onSubmit = async (data: CreatePostData) => {
        const success = await createPost(data.title, data.content)
        if (success) goHome()
    }
    return (
        <main className='mx-auto w-full max-w-2xl px-4 py-8'>
            <h1 className='mb-6 text-2xl font-bold'>Create post</h1>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input id='title' {...register('title', { required: 'Title is required' })}/>
                    {errors.title && <p className='text-sm'>{errors.title.message}</p>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='content'>Content</Label>
                    <Textarea id='content' rows={10} {...register('content', { required: 'Content is required' })} />
                    {errors.content && <p className='text-sm'>{errors.content.message}</p>}
                </div>
                {error && <p className='text-sm'>{error}</p>}
                <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create post'}
                </Button>
            </form>
        </main>
    )
}