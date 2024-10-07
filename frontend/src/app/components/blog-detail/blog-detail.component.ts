import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service'; // Ajuste o caminho conforme necessário
import { CommentService } from '../../services/comment.service'; // Ajuste o caminho conforme necessário
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho conforme necessário
import { Comment } from '../../models/comment.model'; // Ajuste o caminho conforme necessário
import { Post } from '../../models/post.model'; // Ajuste o caminho conforme necessário
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html', // Ajuste o caminho conforme necessário
  styleUrls: ['./blog-detail.component.css'], // Ajuste o caminho conforme necessário
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  postId: number = 0; // Inicializa postId com um valor padrão
  post: Post | null = null; // Propriedade para armazenar o post
  comments: Comment[] = []; // Array para armazenar comentários
  newComment: string = ''; // Campo para novo comentário
  editCommentId: number | null = null; // ID do comentário em edição
  editCommentContent: string = ''; // Conteúdo do comentário em edição
  userName: string | undefined;
  isLoggedIn: boolean = false; // Verifica se o usuário está logado
  categories: any[] = []; // Propriedade para armazenar as categorias
  private userNameSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private categoriesService: CategoryService
  ) {
    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name; // Atualiza o nome do usuário quando ele muda
    });
  }

  ngOnInit(): void {
    const postIdParam = this.route.snapshot.paramMap.get('id'); // Obtém o ID do post da rota
    if (postIdParam) {
      this.postId = +postIdParam; // Converte para número se não for null
      this.isLoggedIn = this.authService.isLoggedIn(); // Verifica se o usuário está logado
      this.loadPost(); // Carrega o post ao inicializar
      this.loadComments(); // Carrega os comentários ao inicializar
      this.loadCategories(); // Carrega as categorias ao inicializar
    }
  }

  // Método para carregar o post
  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe(
      (post) => {
        this.post = post; // Atribui o post carregado
        // Inicializa o array de comentários se não existir
        this.post.comments = this.post.comments || [];
      },
      (error) => {
        console.error('Erro ao carregar o post:', error);
      }
    );
  }

  // Método para carregar comentários
  loadComments(): void {
    this.commentService.getCommentsByPostId(this.postId).subscribe(
      (comments: Comment[]) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Erro ao carregar comentários:', error);
      }
    );
  }

  // Método para carregar categorias
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe(
      (categories) => {
        this.categories = categories; // Atribui as categorias carregadas
      },
      (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    );
  }

  // Método para adicionar um novo comentário
  addComment(): void {
    const userId = parseInt(localStorage.getItem('userId') || '0', 10); // Obtém o ID do usuário logado

    const comment: Comment = {
      postId: this.postId,
      userId: userId,
      content: this.newComment,
      created_at: new Date().toISOString(), // Define o timestamp atual
      visibility: 'public' // Define a visibilidade padrão
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
  }

  // Método para salvar o comentário editado
  saveComment(): void {
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
              this.comments[index].content = this.editCommentContent; // Usando o conteúdo editado diretamente
            }
            // Limpa os campos de edição
            this.cancelEdit();
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

  // Método para cancelar a edição
  cancelEdit(): void {
    this.editCommentId = null; // Reseta o ID do comentário em edição
    this.editCommentContent = ''; // Limpa o conteúdo do campo de edição
  }

  ngOnDestroy(): void {
    this.userNameSubscription.unsubscribe(); // Limpa a assinatura ao destruir o componente
  }
}
