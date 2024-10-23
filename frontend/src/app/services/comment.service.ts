import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  tap,
  throwError,
  of
} from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  comments$ = this.commentsSubject.asObservable(); // Expondo o observable

  constructor(private http: HttpClient) {
    this.getAllComments().subscribe((comments) => {
      this.commentsSubject.next(comments);
    });
  }

  addComment(comment: { content: string; postId: number }): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      tap((newComment) => {
        const currentComments = this.commentsSubject.value;
        this.commentsSubject.next([...currentComments, newComment]); // Atualizando o BehaviorSubject
      })
    );
  }

  getAllComments(): Observable<Comment[]> {
    console.log('Fetching all comments from API...');
    return this.http.get<Comment[]>(this.apiUrl).pipe(
      tap((comments) => {
        this.commentsSubject.next(comments); // Atualizando o BehaviorSubject
      }),
      catchError((error) => {
        console.error('Error fetching comments:', error);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  updateComments(comments: Comment[]): void {
    this.commentsSubject.next(comments);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).pipe(
      tap((comments) => console.log('Comentários recebidos:', comments)),
      catchError((error) => {
        console.error('Erro ao buscar comentários:', error);
        return throwError(error);
      })
    );
  }

  updateComment(commentId: number, commentData: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, commentData).pipe(
      tap((updatedComment) => {
        const currentComments = this.commentsSubject.value.map(comment =>
          comment.id === commentId ? updatedComment : comment
        );
        this.commentsSubject.next(currentComments); // Atualizando o BehaviorSubject
      })
    );
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`).pipe(
      tap(() => {
        const currentComments = this.commentsSubject.value.filter(comment => comment.id !== commentId);
        this.commentsSubject.next(currentComments); // Atualizando o BehaviorSubject
      })
    );
  }
}
