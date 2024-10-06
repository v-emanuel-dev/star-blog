export interface Post {
  id?: number;
  title: string;
  content: string;
  userId: number;
  visibility: string;
  userName?: string; // Adicionando o campo userName
}
