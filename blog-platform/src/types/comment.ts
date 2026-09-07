import type { PostAuthor } from "./post"

export type Comment = {
    id: string,
    content: string,
    author: PostAuthor,
    createdAt: string
}

export type CommentsListResponse = {
    comments: Comment[],
    count: number
}