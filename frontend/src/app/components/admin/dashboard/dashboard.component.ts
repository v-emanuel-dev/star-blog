import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { PostService } from '../../../services/post.service';
import { User } from '../../../models/user.model';
import { Post } from '../../../models/post.model';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { Comment } from '../../../models/comment.model';
import { CommentService } from '../../../services/comment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  logout() {}
  users$: Observable<User[]>;
  posts$: Observable<Post[]>;
  categories$: Observable<Category[]>;
  comments$: Observable<Comment[]>;

  loading: boolean = true; // Indicador de carregamento
  message: string | null = null;
  editingUser: User | null = null;
  editingPost: Post | null = null;
  editingCategory: Category | null = null;
  editingComment: Comment | null = null;
  editingPostId: number | undefined; // Aceita undefined
  editingCategoryId: number | null = null; // Agora é do tipo number | null
  editingUserId: number | null = null; // Agora é do tipo number | null
  editingCommentId: number | null = null; // Agora é do tipo number | null
  selectedTab: string = 'users'; // Inicializa com a aba "users" selecionada

  constructor(
    private userService: UserService,
    private postService: PostService,
    private categoryService: CategoryService,
    private commentService: CommentService
  ) {
    this.users$ = this.userService.users$; // Assina os usuários
    this.posts$ = this.postService.posts$; // Assina os posts
    this.categories$ = this.categoryService.categories$; // Assina as categorias
    this.comments$ = this.commentService.comments$; // Assina os comentários
  }

  ngOnInit() {
    console.log('ngOnInit called');
    this.loadUsers(); // Carrega usuários inicialmente
    this.loadPostsAdmin(); // Carrega posts de admin
    this.loadCategories();
    this.loadComments();
  }

  // Método para carregar usuários
  loadUsers(): void {
    this.loading = true; // Inicia o estado de carregamento
    console.log('Loading users...');
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded successfully:', users);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.message = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  // Método para carregar posts de admin
  loadPostsAdmin(): void {
    this.loading = true; // Inicia o estado de carregamento
    console.log('Loading posts...');
    this.postService.getPostsAdminDashboard().subscribe({
      next: (posts) => {
        console.log('Posts loaded successfully:', posts);
        this.loading = false; // Atualiza o estado de carregamento
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.message = 'Failed to load posts.';
        this.loading = false; // Atualiza o estado de carregamento
      },
    });
  }

  // Método para carregar categorias
  loadCategories(): void {
    this.loading = true; // Inicia o estado de carregamento
    console.log('Loading categories...');
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded successfully:', categories);
        this.categories$ = of(categories); // Atualiza categories$
        this.loading = false; // Atualiza o estado de carregamento
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.message = 'Failed to load categories.';
        this.loading = false; // Atualiza o estado de carregamento
      },
    });
  }

  loadComments(): void {
    this.loading = true; // Inicia o estado de carregamento
    console.log('Loading comments...');
    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        console.log('Comments loaded successfully:', comments);
        this.commentService.updateComments(comments); // Atualiza o BehaviorSubject
        this.loading = false; // Atualiza o estado de carregamento
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.message = 'Failed to load comments.';
        this.loading = false; // Atualiza o estado de carregamento
      },
    });
  }

  // Iniciar a edição de um post
  startEditPost(post: Post): void {
    if (post && post.id !== undefined) {
      // Verifica se post e post.id são válidos
      this.editingPostId = post.id; // Atribuição segura
      this.editingPost = { ...post }; // Cópia do post para edição
    } else {
      console.error('Post is invalid or has no ID');
    }
  }

  // Salvar as alterações no post
  saveEditPost(): void {
    if (this.editingPost && this.editingPost.id !== undefined) {
      console.log('Saving post:', this.editingPost);
      this.postService
        .updatePostDashboard(this.editingPost.id, this.editingPost)
        .subscribe({
          next: () => {
            console.log('Post updated successfully');
            this.editingPost = null; // Limpa o campo de edição
            this.editingPostId = undefined; // Fecha o formulário de edição
            this.loadPostsAdmin(); // Recarrega os posts após a edição
          },
          error: (err) => {
            console.error('Error updating post:', err);
          },
        });
    } else {
      console.error('Post ID is undefined or editingPost is null');
    }
  }

  // Método para deletar um post
  deletePost(postId: number): void {
    console.log('Attempting to delete post with ID:', postId);
    this.loading = true;
    this.postService.deletePost(postId).subscribe({
      next: () => {
        console.log('Post deleted successfully:', postId);
        this.message = 'Post deleted successfully!';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.message = 'Failed to delete post.';
        this.loading = false;
      },
    });
  }

  cancelPostEdit(): void {
    this.editingPost = null; // Limpa a edição
    this.editingPostId = undefined; // Fecha o formulário de edição
  }

  // Editar usuário
  startEditUser(user: User): void {
    this.editingUserId = user.id;
    this.editingUser = { ...user }; // Clona o objeto user para edição
  }

  saveEditUser(user: User | null): void {
    if (user && this.editingUser) {
      // Verifica se user e editingUser não são null
      this.userService.updateUserAdmin(user.id, this.editingUser).subscribe({
        next: () => {
          console.log('User updated successfully:', this.editingUser);
          this.editingUserId = null; // Limpa a edição
          this.editingUser = null;
          this.loadUsers(); // Recarrega os usuários após a edição
        },
        error: (err) => {
          console.error('Error updating user:', err);
        },
      });
    }
  }

  cancelUserEdit(): void {
    this.editingUserId = null;
    this.editingUser = null;
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.loadUsers(); // Recarrega a lista de usuários
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      },
    });
  }

  // Método para adicionar uma nova categoria
  addCategory(newCategory: string): void {
    console.log('Adding new category:', newCategory);
    const category: Category = { id: 0, name: newCategory, postId: 0 }; // Supondo que o ID será gerado no backend
    this.categoryService.createCategory(category).subscribe({
      next: () => {
        console.log('Category added successfully');
        this.loadCategories(); // Recarrega as categorias após a adição
      },
      error: (error) => {
        console.error('Error adding category:', error);
      },
    });
  }

  // Iniciar a edição de uma categoria
  startEditCategory(category: Category): void {
    console.log('Editing category:', category);
    this.editingCategory = { ...category };
  }

  // Salvar as alterações na categoria
  saveEditCategory(category: Category): void {
    if (this.editingCategory && this.editingCategory.id !== undefined) {
      console.log('Saving category:', this.editingCategory);
      this.categoryService
        .updateCategory(this.editingCategory.id, this.editingCategory)
        .subscribe({
          next: () => {
            console.log('Category updated successfully');
            this.editingCategory = null; // Limpa o campo de edição
            this.loadCategories(); // Recarrega as categorias após a edição
          },
          error: (err) => {
            console.error('Error updating category:', err);
          },
        });
    } else {
      console.error('Category ID is undefined');
    }
  }

  deleteCategory(categoryId: number): void {
    console.log('Attempting to delete category with ID:', categoryId);
    this.loading = true; // Define o estado de carregamento como verdadeiro

    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        console.log('Category deleted successfully:', categoryId);
        this.message = 'Category deleted successfully!'; // Mensagem de sucesso
        this.loading = false; // Define o estado de carregamento como falso
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.message = 'Failed to delete category.'; // Mensagem de erro
        this.loading = false; // Define o estado de carregamento como falso
      },
    });
  }

  // Cancelar a edição de uma categoria
  cancelEditCategory(): void {
    console.log('Edit canceled');
    this.editingCategory = null; // Limpa a edição
  }

  // Método para deletar um comentário
  deleteComment(commentId: number): void {
    console.log('Attempting to delete comment with ID:', commentId);
    this.loading = true;
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        console.log('Comment deleted successfully:', commentId);
        this.message = 'Comment deleted successfully!';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.message = 'Failed to delete comment.';
        this.loading = false;
      },
    });
  }

  // Iniciar a edição de um comentário
  startEditComment(comment: Comment): void {
    console.log('Editing comment:', comment);
    this.editingComment = { ...comment };
  }

  // Salvar as alterações no comentário
  saveEditComment(comment: Comment): void {
    if (this.editingComment && this.editingComment.id !== undefined) {
      console.log('Saving comment:', this.editingComment);
      this.commentService
        .updateComment(this.editingComment.id, this.editingComment)
        .subscribe({
          next: () => {
            console.log('Comment updated successfully');
            this.editingComment = null; // Limpa o campo de edição
            this.loadComments(); // Recarrega os comentários após a edição
          },
          error: (err) => {
            console.error('Error updating comment:', err);
          },
        });
    } else {
      console.error('Comment ID is undefined');
    }
  }

  // Cancelar a edição de um comentário
  cancelEditComment(): void {
    console.log('Edit canceled');
    this.editingComment = null; // Limpa a edição
  }

  // Método para cancelar a edição de uma categoria
  cancelCategoryEdit(): void {
    console.log('Canceled category edit');
    this.editingCategory = null; // Limpa a edição
  }

  // Selecionar a aba atual
  selectTab(tab: string): void {
    console.log('Tab selected:', tab);
    this.selectedTab = tab; // Atualiza a aba selecionada
  }
}
