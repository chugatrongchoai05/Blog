// discriminated union trong TypeScript, 
// thay vì View là string đơn giản, 
// nó có thể là 1 object có field type để phân biệt, 
// và mỗi loại object có thể có thêm field riêng.

export type View = 
    | { type: 'home' } 
    | { type: 'post-detail'; postId: string } 
    | { type: 'login' } 
    | { type: 'register' } 
    | { type: 'profile' } 
    | { type: 'create-post' }
    | { type: 'edit-post'; postId: string }