// src/app/services/post.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  // Método para obter o token
  private getToken(): string | null {
    return localStorage.getItem('token'); // Ou outro método de obtenção do token
  }

  // Método para criar um post
  createPost(post: Post): Observable<Post> {
    const token = this.getToken();
    return this.http.post<Post>(this.apiUrl, post, {
      headers: {
        Authorization: `Bearer ${token}` // Assegure-se que o token é válido e não é `null`
      }
    });
  }

  // Método para buscar um post específico pelo ID
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  // Método para obter todos os posts
  getPosts(): Observable<Post[]> {
    const token = this.getToken();
    return this.http.get<Post[]>(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Método para obter um post por ID
  getPostById(postId: number): Observable<Post> {
    const token = this.getToken();
    return this.http.get<Post>(`${this.apiUrl}/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Método para atualizar um post
  updatePost(postId: number, post: Post): Observable<Post> {
    const token = this.getToken();
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, post, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Método para deletar um post
  deletePost(postId: number): Observable<void> {
    const token = this.getToken();
    return this.http.delete<void>(`${this.apiUrl}/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
