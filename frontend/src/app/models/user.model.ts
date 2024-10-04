export interface User {
  id: number;
  email: string;
  password: string; // Se não precisar expor a senha, remova essa propriedade
}
