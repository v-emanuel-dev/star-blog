// comment.model.ts
export interface Comment {
  id?: number; // Adicione esta linha para incluir o ID do comentário
  postId: number; // ID do post ao qual o comentário pertence
  userId: number; // ID do usuário que fez o comentário
  content: string; // Conteúdo do comentário
  timestamp?: Date; // Timestamp opcional para quando o comentário foi criado
}
