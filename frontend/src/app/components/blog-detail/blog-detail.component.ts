import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';
import { Post } from '../../models/post.model';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  postId: number = 0;
  post: Post | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  editCommentId: number | null = null;
  editCommentContent: string = '';
  userName: string | undefined;
  isLoggedIn: boolean = false;
  categories: Category[] = []; // Array para armazenar as categorias
  allCategories: Category[] = []; // Para todas as categorias
  newCategoryName: string = ''; // Campo para o nome da nova categoria
  editCategoryId: number | null = null; // ID da categoria em edição
  editCategoryName: string = ''; // Nome da categoria em edição
  private userNameSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.userNameSubscription = this.authService.userName$.subscribe((name) => {
      this.userName = name;
    });
  }

  ngOnInit(): void {
    const postIdParam = this.route.snapshot.paramMap.get('id');
    if (postIdParam) {
      this.postId = +postIdParam;
      this.isLoggedIn = this.authService.isLoggedIn();
      this.loadPost();
      this.loadComments();
      this.loadCategories(this.postId);
    }
  }

  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe(
      (post) => {
        this.post = post;
        this.post.comments = this.post.comments || [];
      },
      (error) => {
        console.error('Erro ao carregar o post:', error);
      }
    );
  }

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

  loadCategories(postId: number): void {
    console.log('Chamando loadCategories com postId:', postId); // Verifica se a função é chamada

    this.categoryService.getCategoriesByPostId(postId).subscribe(
      (data: Category[]) => {
        console.log('postId:', postId);
        console.log('Categorias carregadas:', data);
        this.categories = data;
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    );
  }

  loadAllCategories(): void {
    console.log('Chamando loadAllCategories');

    this.categoryService.getAllCategories().subscribe(
      (data: Category[]) => {
        console.log('Todas as categorias carregadas:', data);
        this.allCategories = data;
      },
      (error) => {
        console.error('Erro ao obter todas as categorias:', error);
      }
    );
  }

  addComment(): void {
    // Obtém o userId do localStorage e converte para número
    const userId = parseInt(localStorage.getItem('userId') || '0', 10) || null;

    console.log('userId obtido:', userId); // Log para verificar o userId

    const comment: Comment = {
      postId: this.postId,
      userId: userId, // Incluindo userId ou null aqui
      content: this.newComment,
      created_at: new Date().toISOString(),
      visibility: 'public',
      timestamp: '',
    };

    console.log('Comentário a ser adicionado:', comment); // Log para verificar os detalhes do comentário

    this.commentService.addComment(comment).subscribe(
      (newComment) => {
        console.log('Novo comentário adicionado:', newComment); // Log para confirmar a adição do comentário
        this.comments.push(newComment);
        this.newComment = '';
      },
      (error) => {
        console.error('Erro ao adicionar comentário:', error); // Log para erros ao adicionar o comentário
      }
    );
  }

  editComment(comment: Comment): void {
    this.editCommentId = comment.id ?? null; // Use o operador nullish coalescing
    this.editCommentContent = comment.content;
  }

  saveComment(): void {
    if (this.editCommentContent && this.editCommentId !== null) {
      this.commentService
        .updateComment(this.editCommentId, { content: this.editCommentContent }) // Certifique-se de que editCommentId está definido
        .subscribe(
          () => {
            const index = this.comments.findIndex(
              (c) => c.id === this.editCommentId
            );
            if (index !== -1) {
              this.comments[index].content = this.editCommentContent;
            }
            this.cancelEdit();
          },
          (error) => {
            console.error('Erro ao salvar comentário:', error);
          }
        );
    }
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.comments = this.comments.filter(
        (comment) => comment.id !== commentId
      );
    });
  }

  cancelEdit(): void {
    this.editCommentId = null;
    this.editCommentContent = '';
  }

  // Métodos para gerenciar categorias
  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const category: Omit<Category, 'id'> = {
        name: this.newCategoryName,
        postId: this.postId, // Inclui o postId aqui
      };

      this.categoryService.createCategory(category).subscribe({
        next: () => {
          this.loadCategories(this.postId); // Recarrega a lista de categorias após a adição
          this.newCategoryName = ''; // Limpa o campo de entrada após adicionar
        },
        error: (error) => {
          console.error('Erro ao criar categoria:', error);
        },
      });
    } else {
      console.error('O nome da categoria não pode estar vazio');
    }
  }

  editCategory(category: Category): void {
    this.editCategoryId = category.id ?? null; // Use o operador nullish coalescing
    this.editCategoryName = category.name;
  }

  saveCategory(): void {
    if (this.editCategoryId && this.editCategoryName && this.postId) {
      const updatedCategory: Category = {
        id: this.editCategoryId,
        name: this.editCategoryName,
        postId: this.postId,
      };

      this.categoryService
        .updateCategory(this.editCategoryId, updatedCategory)
        .subscribe({
          next: () => {
            this.loadCategories(this.postId); // Recarrega a lista de categorias após a atualização
            this.cancelEditCategory(); // Limpa o estado de edição
          },
          error: (error) => {
            console.error('Erro ao atualizar categoria:', error);
          },
        });
    } else {
      console.error(
        'O nome da categoria e o ID do post não podem estar vazios'
      );
    }
  }

  deleteCategory(categoryId: number): void {
    this.categoryService.deleteCategory(categoryId).subscribe(() => {
      this.categories = this.categories.filter((cat) => cat.id !== categoryId);
    });
  }

  cancelEditCategory(): void {
    this.editCategoryId = null;
    this.editCategoryName = '';
  }

  ngOnDestroy(): void {
    this.userNameSubscription.unsubscribe(); // Limpa a assinatura ao destruir o componente
  }
}
