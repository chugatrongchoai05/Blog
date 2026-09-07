import { useForm, type SubmitHandler } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

type LoginFormInputs = { email: string, password: string }

export function LoginPage() {
    const { register, handleSubmit, formState: {errors} } = useForm<LoginFormInputs>()
    const login = useAuthStore((state) => state.login)
    const isLoading = useAuthStore((state) => state.isLoading)
    const error = useAuthStore((state) => state.error)
    const goHome = useNavigationStore((state) => state.goHome)
    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        const success = await login(data.email, data.password)
        if (success) goHome()
    }
    return (
        <main className='mx-auto w-full max-w-md px-4 py-8'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle className='mb-6 text-2xl font-bold'>Log in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input id='email' {...register('email', { required: true })} />
                            {errors.email && <p className='text-sm'>Email is required</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input id='password' type='password' {...register('password', { required: true })} />
                            {errors.password && <p className='text-sm'>Password is required</p>}
                        </div>
                        {error && <p className='text-sm'>{error}</p>}
                        <Button type='submit' className='w-full' disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}