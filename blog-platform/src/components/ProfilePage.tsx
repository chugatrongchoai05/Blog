import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProfileData = { name: string, email: string }

export function ProfilePage() {
    const currentUser = useAuthStore((state) => state.currentUser)
    const updateProfile = useAuthStore((state) => state.updateProfile)
    const isLoading = useAuthStore((state) => state.isLoading)
    const error = useAuthStore((state) => state.error)
    const goHome = useNavigationStore((state) => state.goHome)
    const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>({
        defaultValues: { name: currentUser?.name ?? '', email: currentUser?.email ?? ''}
    })
    const onSubmit = async (data: ProfileData) => {
        const success = await updateProfile(data.name, data.email)
        if (success) goHome()
    }
    if (!currentUser) return null
    return (
        <main className='mx-auto w-full max-w-md px-4 py-8'>
            <h1 className='mb-6 text-2xl font-bold'>Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='profile-name'>Name</Label>
                    <Input id='profile-name' {...register('name', { required: 'Name is required' })}/>
                    {errors.name && <p className='text-sm'>{errors.name.message}</p>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='profile-email'>Email</Label>
                    <Input id='profile-email' {...register('email', { required: 'Email is required' })}/>
                    {errors.email && <p className='text-sm'>{errors.email.message}</p>}
                </div>
                {error && <p className='text-sm'>{error}</p>}
                <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update profile'}
                </Button>
            </form>
        </main>
    )
}