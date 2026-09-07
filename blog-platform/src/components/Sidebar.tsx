import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useNavigationStore } from '@/stores/navigationStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

function NavLinks({ onNavigate }: { onNavigate: () => void }) {
    const currentView = useNavigationStore((state) => state.currentView)
    const goHome = useNavigationStore((state) => state.goHome)
    const goToProfile = useNavigationStore((state) => state.goToProfile)
    const goToCreatePost = useNavigationStore((state) => state.goToCreatePost)
    const goToLogin = useNavigationStore((state) => state.goToLogin)
    const goToRegister = useNavigationStore((state) => state.goToRegister)
    const currentUser = useAuthStore((state) => state.currentUser)
    const logout = useAuthStore((state) => state.logout)
    const isAuthenticated = currentUser !== null
    return (
        <nav className='flex flex-col gap-2'>
            <Button
            variant={currentView.type === 'home' ? 'default' : 'ghost'}
            className={cn('justify-start', currentView.type === 'home' && 'font-bold')}
            onClick={() => {goHome(); onNavigate()}}>
                Home
            </Button>
            {isAuthenticated ? (
                <>
                <Button
                variant={currentView.type === 'profile' ? 'default' : 'ghost'}
                className={cn('justify-start', currentView.type === 'profile' && 'font-bold')}
                onClick={() => {goToProfile(); onNavigate()}}>
                    Profile
                </Button>
                <Button
                variant={currentView.type === 'create-post' ? 'default' : 'ghost'}
                className={cn('justify-start', currentView.type === 'create-post' && 'font-bold')}
                onClick={() => {goToCreatePost(); onNavigate()}}>
                    Create post
                </Button>
                <Button variant='ghost' className='justify-start' onClick={() => {logout(); onNavigate()}}>
                    Log out
                </Button>
                </>
            ) : (
                <>
                <Button
                variant={currentView.type === 'login' ? 'default' : 'ghost'}
                className={cn('justify-start', currentView.type === 'login' && 'font-bold')}
                onClick={() => {goToLogin(); onNavigate()}}>
                    Log in
                </Button>
                <Button
                variant={currentView.type === 'register' ? 'default' : 'ghost'}
                className={cn('justify-start', currentView.type === 'register' && 'font-bold')}
                onClick={() => {goToRegister(); onNavigate()}}>
                    Register
                </Button>
                </>
            )}
        </nav>
    )
}

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <aside className='hidden md:flex md:w-64 md:flex-col md:border-r md:p-4 md:sticky md:top-0 md:h-screen'>
                <NavLinks onNavigate={() => {}} />
            </aside>
            <div className='md:hidden p-4'>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant='ghost' size='icon'>
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side='left'>
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <NavLinks onNavigate={() => setIsOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}