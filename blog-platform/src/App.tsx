import { useEffect, type ReactNode } from 'react'
import { useNavigationStore } from '@/stores/navigationStore'
import { useAuthStore } from '@/stores/authStore'
import { HomePage } from '@/components/HomePage'
import { PostDetailPage } from '@/components/PostDetailPage'
import { LoginPage } from '@/components/LoginPage'
import { RegisterPage } from '@/components/RegisterPage'
import { ProfilePage } from '@/components/ProfilePage'
import { CreatePostPage } from '@/components/CreatePostPage'
import { Sidebar } from '@/components/Sidebar'
import { EditPostPage } from '@/components/EditPostPage'

const PROTECTED_VIEWS = ['profile', 'create-post', 'edit-post']

function assertNever(value: never): never {
  throw new Error(`Unhandled view type: ${JSON.stringify(value)}`)
}

function App() {
  const currentView = useNavigationStore((state) => state.currentView)
  const goToLogin = useNavigationStore((state) => state.goToLogin)
  const currentUser = useAuthStore((state) => state.currentUser)
  const isProtectedView = PROTECTED_VIEWS.includes(currentView.type)
  const isUnauthenticated = currentUser === null
  useEffect(() => {
    if (isProtectedView && isUnauthenticated) { goToLogin() }
  }, [isProtectedView, isUnauthenticated, goToLogin])

  if (isProtectedView && isUnauthenticated) return <LoginPage />

  if (currentView.type === 'login' || currentView.type === 'register') {
    return currentView.type === 'login' ? <LoginPage /> : <RegisterPage />
  }
  let content: ReactNode
  switch (currentView.type) {
    case 'home':
      content = <HomePage />
      break
    case 'post-detail':
      content = <PostDetailPage postId={currentView.postId} />
      break
    case 'profile':
      content = <ProfilePage />
      break
    case 'create-post':
      content = <CreatePostPage />
      break
    case 'edit-post':
      content = <EditPostPage postId={currentView.postId} />
      break
    default: return assertNever(currentView)
  }
  return (
    <div className='flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1'>{content}</div>
    </div>
  )
}

export default App