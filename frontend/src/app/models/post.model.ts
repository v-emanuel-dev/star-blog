export interface Post {
  id?: number;
  title: string;
  content: string;
  userId: number;
  visibility: string;
  created_at?: string
  username: string;
  categoryId: number;
  comments?: Comment[]; // Adicione esta linha
}
