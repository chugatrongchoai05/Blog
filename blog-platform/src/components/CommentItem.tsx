import { useState } from 'react'
import type { Comment } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentItemProps {
    comment: Comment
    currentUserId: string | undefined
    isEditing: boolean
    isSubmitting: boolean
    onStartEdit: (id: string) => void
    onCancelEdit: () => void
    onUpdate: (id: string, content: string) => Promise<boolean>
    onDelete: (id: string) => Promise<boolean>
}

export function CommentItem({
    comment, currentUserId, isEditing, isSubmitting, onStartEdit, onCancelEdit, onUpdate, onDelete
}: CommentItemProps) {
    const [draft, setDraft] = useState(comment.content)
    const isAuthor = currentUserId === comment.author.id
    async function handleSave() {
        const success = await onUpdate(comment.id, draft)
        if (success) onCancelEdit()
    }
    function handleCancel() {
        setDraft(comment.content)
        onCancelEdit()
    }
    if (isEditing) return (
        <li className='space-y-2'>
            <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} disabled={isSubmitting} />
            <div className='flex gap-2'>
                <Button type='button' onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
            </div>
        </li>
    )
    return (
        <li>
            <p className='font-semibold'>{comment.author.name}:</p> 
            <p>'{comment.content}'</p>
            {isAuthor && (
                <div>
                    <Button type='button' variant='outline' size='sm' onClick={() => onStartEdit(comment.id)} disabled={isSubmitting}>
                        Edit
                    </Button>
                    <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(comment.id)} disabled={isSubmitting}>
                        Delete
                    </Button>
                </div>
            )}
        </li>
    )
}