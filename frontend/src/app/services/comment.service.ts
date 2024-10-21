// comment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError,
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
    // Opcional: carregar comentários iniciais, se necessário
    this.getAllComments().subscribe((comments) =>
      this.commentsSubject.next(comments)
    );
  }

  // Método para iniciar a edição de um comentário
  startEditComment(commentId: number) {
    const comments = this.commentsSubject.value;
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    if (commentToEdit) {
      // Emitir comentário para edição
      console.log('Editando comentário:', commentToEdit);
      // Adicione a lógica para editar aqui
    }
  }

  addComment(comment: {
    content: string;
    postId: number;
  }): Observable<Comment> {
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
        console.log('Comments fetched successfully:', comments); // Log dos comentários recebidos
        this.commentsSubject.next(comments); // Atualizando o BehaviorSubject
      }),
      catchError((error) => {
        console.error('Error fetching comments:', error); // Log de erro
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`).pipe(
      tap((comments) => console.log('Comentários recebidos:', comments)),
      map((comments) =>
        comments.sort(
          (a, b) =>
            new Date(b.created_at!).getTime() -
            new Date(a.created_at!).getTime()
        )
      ),
      catchError((error) => {
        console.error('Erro ao buscar comentários:', error);
        return throwError(error);
      })
    );
  }

  updateComment(commentId: number, commentData: Comment): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, commentData);
  }


  deleteComment(commentId: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http
      .delete(`${this.apiUrl}/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap(() => {
          const currentComments = this.commentsSubject.value;
          this.commentsSubject.next(
            currentComments.filter((comment) => comment.id !== commentId)
          ); // Atualizando o BehaviorSubject
        })
      );
  }
}
