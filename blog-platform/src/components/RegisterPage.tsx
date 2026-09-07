import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

type RegisterFormData = { name: string, email: string, password: string, confirmPassword: string }

export function RegisterPage() {
    const { register: registerField, handleSubmit, getValues, formState: { errors } } = useForm<RegisterFormData>()
    const registerUser = useAuthStore((state) => state.register)
    const isLoading = useAuthStore((state) => state.isLoading)
    const error = useAuthStore((state) => state.error)
    const goHome = useNavigationStore((state) => state.goHome)
    const onSubmit = async (data: RegisterFormData) => {
        const success = await registerUser(data.email, data.password, data.name)
        if (success) goHome()
    }
    return (
        <main className='mx-auto w-full max-w-md px-4 py-8'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle className='mb-6 text-2xl font-bold'>Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Name</Label>
                            <Input id='name' {...registerField('name', { required: 'Name is required' })} />
                            {errors.name && <p className='text-sm'>{errors.name.message}</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input id='email' type='email' {...registerField('email', { required: 'Email is required' })} />
                            {errors.email && <p className='text-sm'>{errors.email.message}</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input id='password' type='password' {...registerField('password', {
                                required: 'Password is required.',
                                minLength: {value: 6, message: 'Password must be at least 6 characters'}
                            })} />
                            {errors.password && <p className='text-sm'>{errors.password.message}</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>Confirm password</Label>
                            <Input id='confirmPassword' type='password' {...registerField('confirmPassword', {
                                required: 'Please confirm your password.',
                                validate: (value) => value === getValues('password') || 'Password does not match'
                            })} />
                            {errors.confirmPassword && <p className='text-sm'>{errors.confirmPassword.message}</p>}
                        </div>
                        {error && <p className='text-sm'>{error}</p>}
                        <Button type='submit' className='w-full' disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}