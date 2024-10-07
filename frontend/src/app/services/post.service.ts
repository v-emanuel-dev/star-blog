import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  // Method to obtain the token
  private getToken(): string | null {
    return localStorage.getItem('accessToken'); // Ensure you retrieve the correct token
  }

  // Method to create a post
  createPost(post: Post): Observable<Post> {
    const token = this.getToken();
    return this.http.post<Post>(this.apiUrl, post, {
      headers: {
        Authorization: `Bearer ${token}`, // Ensure the token is valid and not null
      },
    });
  }

  getPosts(): Observable<Post[]> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post[]>(this.apiUrl, { headers }).pipe(
      map((posts) => {
        // Processar comentários nos posts
        posts.forEach(post => {
          });

        // Se o usuário estiver logado, retorne todos os posts
        if (this.isLoggedIn()) {
          return posts.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Ordenação decrescente
          });
        } else {
          // Retornar apenas posts públicos e ordená-los
          return posts
            .filter((post) => post.visibility === 'public')
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA; // Ordenação decrescente
            });
        }
      })
    );
  }

  // Method to fetch a specific post by ID
  getPostById(postId: number): Observable<Post> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post>(`${this.apiUrl}/${postId}`, { headers });
  }

  // Method to fetch private posts for a user
  getPrivatePosts(userId: number): Observable<Post[]> {
    const token = this.getToken();
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token
      },
    });
  }

  // Method to update a post
  updatePost(postId: number, post: Post): Observable<Post> {
    const token = this.getToken();
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, post, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token
      },
    });
  }

  // Method to delete a post
  deletePost(postId: number): Observable<void> {
    const token = this.getToken();
    return this.http.delete<void>(`${this.apiUrl}/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token
      },
    });
  }

  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    return localStorage.getItem('accessToken') !== null; // Check for access token
  }
}
