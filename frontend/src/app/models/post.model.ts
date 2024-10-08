export interface Post {
  id?: number;
  title: string;
  content: string;
  user_id: number;
  visibility: string;
  created_at?: string
  username?: string;
  categoryId?: number | null; // Opcional, se a categoria não estiver definida
  comments?: Comment[]; // Adicione esta linha
  category_name?: string; // Adicione esta linha
}
