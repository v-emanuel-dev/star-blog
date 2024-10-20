import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject, throwError } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';
  private postsUpdated = new Subject<Post[]>();
  private posts: Post[] = []; // Armazena a lista atual de posts

  constructor(private http: HttpClient) {}

  // Método para obter o token
  private getToken(): string | null {
    return localStorage.getItem('token'); // Certifique-se de recuperar o token correto
  }

  toggleLike(postId: number): Observable<any> {
    const token = this.getToken();

    return this.http.post<any>(
      `${this.apiUrl}/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token de autenticação no cabeçalho
        },
      }
    );
  }

  updatePostLikes(postId: number, likes: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${postId}`, { likes });
  }

  // Método para criar um post
  createPost(post: Post): Observable<Post> {
    console.log('Post a ser criado:', post); // Adicione este log para depuração
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.post<Post>(this.apiUrl, post, { headers }).pipe(
      map((newPost) => {
        this.posts.push(newPost); // Adiciona o novo post à lista de posts
        this.postsUpdated.next(this.posts); // Emite a nova lista de posts
        return newPost;
      }),
      catchError((error) => {
        console.error('Erro ao criar post:', error);
        return throwError(() => new Error('Erro ao criar post.'));
      })
    );
  }

  getPostsAdmin(): Observable<Post[]> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post[]>(`${this.apiUrl}/admin`, { headers });
  }

  getPosts(): Observable<Post[]> {
    const token = this.getToken();
    const headers = token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders();

    return this.http.get<Post[]>(this.apiUrl, { headers }).pipe(
        map((posts) => {
            console.log('Posts recebidos da API:', posts);

            // Processa likes
            posts.forEach((post) => {
                post.likes = post.likes || 0;
            });

            // Filtra posts públicos se não estiver logado
            const filteredPosts = this.isLoggedIn()
                ? posts
                : posts.filter((post) => post.visibility === 'public');

            console.log('Posts filtrados:', filteredPosts); // Log dos posts filtrados
            return filteredPosts; // Retorna os posts filtrados
        }),
        catchError((error) => {
            console.error('Erro ao buscar posts:', error);
            return of([]); // Retorna um array vazio em caso de erro
        })
    );
}

  // Método para buscar um post específico pelo ID
  getPostById(postId: number): Observable<Post> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post>(`${this.apiUrl}/${postId}`, { headers });
  }

  // Método para buscar posts privados de um usuário
  getPrivatePosts(userId: number): Observable<Post[]> {
    const token = this.getToken();
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclua o token
      },
    });
  }

  // Método para atualizar um post
  updatePost(postId: number, post: Post): Observable<Post> {
    const token = this.getToken();
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, post, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho
      },
    });
  }

  // Método para deletar um post
  deletePost(postId: number): Observable<void> {
    const token = this.getToken();
    return this.http
      .delete<void>(`${this.apiUrl}/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclua o token
        },
      })
      .pipe(
        map(() => {
          this.posts = this.posts.filter((post) => post.id !== postId); // Remove o post deletado da lista
          this.postsUpdated.next(this.posts); // Emite a nova lista de posts
        }),
        catchError((error) => {
          console.error('Erro ao deletar post:', error);
          return throwError(() => new Error('Erro ao deletar post.'));
        })
      );
  }

  // Método auxiliar para verificar se o usuário está logado
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null; // Verifique se há token de acesso
  }

  // Método para obter um Observable com a lista atualizada de posts
  getPostsUpdateListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable(); // Permite que outros componentes se inscrevam para atualizações
  }
}
