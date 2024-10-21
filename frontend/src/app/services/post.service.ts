import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, Subject, tap, throwError } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';
  private postsUpdated = new Subject<Post[]>();
  private posts: Post[] = []; // Armazena a lista atual de posts
  private postsSubject = new BehaviorSubject<Post[]>([]);
  posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPostsAdmin(): Observable<Post[]> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post[]>(`${this.apiUrl}/admin`, { headers }).pipe(
      map((posts) => {
        posts.forEach((post) => (post.likes = post.likes || 0));
        this.postsSubject.next(posts); // Atualiza o BehaviorSubject
        return posts;
      }),
      catchError((error) => {
        console.error('Erro ao buscar posts para admin:', error);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  getPosts(): Observable<Post[]> {
    console.log('Fetching posts from API...'); // Log quando a função é chamada
    return this.http.get<Post[]>(this.apiUrl).pipe(
      map((posts) => {
        console.log('Posts fetched successfully:', posts); // Log quando os posts são recebidos
        this.postsSubject.next(posts); // Atualiza o BehaviorSubject
        return posts;
      }),
      catchError((error) => {
        console.error('Error fetching posts:', error); // Log de erro
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('token'); // Certifique-se de recuperar o token correto
  }

  // Método para iniciar a edição de um post
  startEditPost(postId: number) {
    // Lógica para carregar o post com base no ID e iniciar o modo de edição
    const posts = this.postsSubject.value;
    const postToEdit = posts.find(post => post.id === postId);
    if (postToEdit) {
      // Emitir post para edição (pode ser através de um BehaviorSubject, por exemplo)
      console.log('Editando post:', postToEdit);
      // Adicione a lógica para editar aqui
    }
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

  // Método para buscar um post específico pelo ID
  getPostById(postId: number): Observable<Post> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

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
  updatePost(postId: number, updatedPost: Post): Observable<Post> {
    // Obtenha o token do serviço de autenticação
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, updatedPost, { headers }).pipe(
      tap(() => {
        const currentPosts = this.postsSubject.getValue();
        const updatedPosts = currentPosts.map(post =>
          post.id === postId ? updatedPost : post
        );
        this.postsSubject.next(updatedPosts);
      })
    );
  }

  // Método para deletar um post
  // Ajuste no PostService
deletePost(id: number): Observable<void> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
    map(() => {
      // Atualiza a lista local de posts após a deleção
      const currentPosts = this.postsSubject.getValue();
      const updatedPosts = currentPosts.filter((post) => post.id !== id);
      this.postsSubject.next(updatedPosts);
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
