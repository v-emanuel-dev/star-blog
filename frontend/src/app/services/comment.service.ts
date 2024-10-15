import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  // Adicionar um novo comentário
  // comment.service.ts
  addComment(comment: {
    content: string;
    postId: number;
  }): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).pipe( // Corrigir a URL
      tap((comments) => console.log('Comentários recebidos:', comments)), // Inspeciona os comentários no console
      map((comments) =>
        comments.sort((a, b) => {
          const timestampA = new Date(a.created_at).getTime(); // Usando created_at para ordenar
          const timestampB = new Date(b.created_at).getTime(); // Usando created_at para ordenar
          return timestampB - timestampA; // Ordena de forma decrescente
        })
      ),
      catchError((error) => {
        console.error('Erro ao buscar comentários:', error);
        return throwError(error);
      })
    );
  }

  // Atualizar um comentário
  updateComment(
    commentId: number,
    updatedComment: { content: string }
  ): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.apiUrl}/${commentId}`,
      updatedComment
    );
  }

  // Deletar um comentário
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
