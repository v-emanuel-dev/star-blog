import { Component } from '@angular/core';
import { CommentService } from '../../../services/comment.service';
import { BehaviorSubject } from 'rxjs';
import { Comment } from '../../../models/comment.model'; // Verifique se o caminho está correto

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
  comments$: BehaviorSubject<Comment[]> = new BehaviorSubject<Comment[]>([]);
  editingComment: Comment | null = null;
  loading: boolean = true;
  message: string | null = null;
  newComment: { content: string; postId: number } = { content: '', postId: 0 };

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        console.log('Comentários carregados:', comments);
        this.comments$.next(comments); // Atualiza o BehaviorSubject
        this.loading = false;
        if (comments.length === 0) {
          this.message = 'Nenhum comentário disponível.';
        } else {
          this.message = null;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar comentários:', error);
        this.loading = false;
        this.message = 'Erro ao carregar comentários.';
      }
    });
  }

  addComment(): void {
    if (!this.newComment.content || !this.newComment.postId) {
      console.warn('Conteúdo ou ID do post não estão definidos.');
      return;
    }

    this.commentService.addComment(this.newComment).subscribe({
      next: (comment) => {
        this.message = 'Comentário adicionado com sucesso!';
        this.loadComments(); // Recarrega os comentários após adicionar
        this.newComment = { content: '', postId: this.newComment.postId }; // Limpa o formulário
      },
      error: (error) => {
        console.error('Erro ao adicionar comentário:', error);
        this.message = 'Falha ao adicionar comentário.';
      }
    });
  }

  startEditComment(comment: Comment): void {
    this.editingComment = { ...comment }; // Cria uma cópia do comentário para edição
  }

  saveEditComment(): void {
    if (this.editingComment && this.editingComment.id !== undefined) {
      this.commentService.updateComment(this.editingComment.id, this.editingComment).subscribe({
        next: () => {
          this.message = 'Comentário atualizado com sucesso!';
          this.loadComments(); // Recarrega os comentários após a atualização
          this.editingComment = null; // Limpa a edição
        },
        error: (error) => {
          console.error('Erro ao atualizar comentário:', error);
          this.message = 'Falha ao atualizar comentário.';
        }
      });
    } else {
      console.warn('Comentário em edição não está definido ou não possui um ID.');
      this.message = 'Falha ao atualizar comentário. ID está faltando.';
    }
  }

  deleteComment(commentId: number | undefined): void {
    if (commentId === undefined) {
      console.warn('ID do comentário está indefinido, não pode ser deletado.');
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.message = 'Comentário deletado com sucesso!';
        this.loadComments(); // Recarrega os comentários após a deleção
      },
      error: (error) => {
        console.error('Erro ao deletar comentário:', error);
        this.message = 'Falha ao deletar comentário.';
      }
    });
  }

  cancelEdit(): void {
    this.editingComment = null; // Limpa a edição
  }
}
