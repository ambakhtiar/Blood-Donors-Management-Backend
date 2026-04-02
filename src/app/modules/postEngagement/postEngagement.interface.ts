export interface ICommentPayload {
  postId: string;
  content: string;
  parentId?: string;
}

export interface IToggleLikePayload {
  postId: string;
}
