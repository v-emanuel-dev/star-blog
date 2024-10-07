import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  // Adicionar um novo comentário
  addComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}`).pipe(
      tap((comments) => console.log('Comentários recebidos:', comments)), // Inspeciona os comentários no console
      catchError((error) => {
        console.error('Erro ao buscar comentários:', error);
        return throwError(error);
      })
    );
  }

  // Atualizar um comentário
  updateComment(commentId: number, updatedComment: { content: string }): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, updatedComment);
  }

  // Deletar um comentário
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
