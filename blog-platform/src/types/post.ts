export type PostAuthor = {
    id: string,
    name: string
}

export type Category = {
    id: string,
    name: string
}

export type Tag = {
    id: string,
    name: string
}

export type Post = {
    id: string,
    title: string,
    slug: string,
    content: string,
    published: boolean,
    author: PostAuthor,
    category?: Category,
    tags: Tag[],
    createdAt: string,
    updatedAt: string
}

export type PaginationMeta = {
    page: number,
    limit: number,
    total: number,
    totalPages: number
}

export type PostsListResponse = {
    success: true,
    data: Post[],
    pagination: PaginationMeta
}

export type PostDetailResponse = {
    success: true,
    post: Post
}

export type ErrorResponse = {
    success: false,
    message: string
}