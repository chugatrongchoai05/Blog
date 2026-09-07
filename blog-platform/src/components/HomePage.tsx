import { useEffect, useState } from 'react'
import { useBlogStore } from '@/stores/blogStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HomePage() {
    const posts = useBlogStore((state) => state.posts)
    const isLoading = useBlogStore((state) => state.isLoading)
    const error = useBlogStore((state) => state.error)
    const fetchPosts = useBlogStore((state) => state.fetchPosts)
    const goToPost = useNavigationStore((state) => state.goToPost)
    const [searchQuery, setSearchQuery] = useState('')
    useEffect(() => {
        const timeout = setTimeout(() => { fetchPosts(searchQuery) }, 400)
        return () => clearTimeout(timeout)
    }, [searchQuery, fetchPosts])
    return (
        <main className='container mx-auto px-4 py-8'>
            <h1 className='mb-6 text-3xl font-bold'>Posts</h1>
            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder='Search posts...' className='mb-6' />
            {isLoading && <p>Loading posts...</p>}
            {error && <p>Error: {error}</p>}
            {!isLoading && !error && (posts.length === 0 ? (<p>No posts found</p>) : (
                <div>
                    {posts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                                <CardDescription>Author: {post.author.name}</CardDescription>
                                <CardDescription>Posted on: {post.createdAt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{post.content.length > 150 ? `${post.content.slice(0, 150)}...` : post.content}</p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => goToPost(post.id)}>Continue reading</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ))}
        </main>
    )
}