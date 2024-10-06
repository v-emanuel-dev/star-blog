import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service'; // Ajuste o caminho conforme necessário
import { CommentService } from '../../services/comment.service'; // Ajuste o caminho conforme necessário
import { Comment } from '../../models/comment.model'; // Ajuste o caminho conforme necessário
import { Post } from '../../models/post.model'; // Ajuste o caminho conforme necessário
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html', // Ajuste o caminho conforme necessário
  styleUrls: ['./blog-detail.component.css'], // Ajuste o caminho conforme necessário
})
export class BlogDetailComponent implements OnInit {
  postId: number = 0; // Inicializa postId com um valor padrão
  post: Post | null = null; // Propriedade para armazenar o post
  comments: Comment[] = []; // Array para armazenar comentários
  newComment: string = ''; // Campo para novo comentário
  editCommentId: number | null = null; // ID do comentário em edição
  editCommentContent: string = ''; // Conteúdo do comentário em edição
  userName: string | undefined;
  private userNameSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService
  ) {
    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name; // Atualiza o nome do usuário quando ele muda
      console.log('Updated Username in Navbar:', this.userName); // Log do nome atualizado no Navbar
    });
  }

  ngOnInit(): void {
    const postIdParam = this.route.snapshot.paramMap.get('id'); // Obtém o ID do post da rota
    if (postIdParam) {
      this.postId = +postIdParam; // Converte para número se não for null
      this.loadPost(); // Carrega o post ao inicializar
    }
    this.loadComments(); // Carrega os comentários ao inicializar

    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }

  // Método para carregar o post
  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe((post) => {
      this.post = post; // Atribui o post à propriedade post
    });
  }

  // Método para carregar comentários
  loadComments(): void {
    this.commentService
      .getCommentsByPostId(this.postId)
      .subscribe((comments) => {
        this.comments = comments; // Atribui os comentários à propriedade comments
      });
  }

  // Método para adicionar um novo comentário
  addComment(): void {
    const userId = parseInt(localStorage.getItem('userId') || '0', 10); // Obtém o ID do usuário logado

    const comment: Comment = {
      postId: this.postId,
      userId: userId,
      content: this.newComment,
      timestamp: new Date(), // Define o timestamp atual
    };

    this.commentService.addComment(comment).subscribe((newComment) => {
      this.comments.push(newComment); // Adiciona o novo comentário à lista
      this.newComment = ''; // Limpa o campo de novo comentário
    });
  }

  // Método para habilitar a edição de um comentário
  editComment(comment: Comment): void {
    this.editCommentId = comment.id !== undefined ? comment.id : null;
    this.editCommentContent = comment.content; // Preenche o campo com o conteúdo existente
    console.log('Editando comentário:', comment);
  }

  saveComment() {
    if (this.editCommentContent && this.editCommentId !== null) {
      this.commentService
        .updateComment(this.editCommentId, { content: this.editCommentContent })
        .subscribe(
          () => {
            // Atualiza a lista de comentários com o novo conteúdo
            const index = this.comments.findIndex(
              (c) => c.id === this.editCommentId
            );
            if (index !== -1) {
              // Atualiza o conteúdo do comentário na lista local
              this.comments[index].content = this.editCommentContent; // Usando o conteúdo editado diretamente
              console.log('Comentário atualizado:', this.comments[index]); // Log do comentário atualizado
            }

            // Limpa os campos de edição
            this.editCommentId = null;
            this.editCommentContent = '';
          },
          (error) => {
            console.error('Erro ao salvar comentário:', error);
          }
        );
    }
  }

  // Método para excluir um comentário
  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(() => {
      // Remove o comentário do array de comentários
      this.comments = this.comments.filter(
        (comment) => comment.id !== commentId
      );
    });
  }

  // Adicione este método ao seu componente
  cancelEdit() {
    this.editCommentId = null; // Reseta o ID do comentário em edição
    this.editCommentContent = ''; // Limpa o conteúdo do campo de edição
  }
}
