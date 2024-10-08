import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css'],
})
export class BlogCreateComponent implements OnInit {
  title: string = '';
  content: string = '';
  message: string = '';
  success: boolean = false;
  visibility: string = 'public';
  user_id: number = 0;
  postId: number | null = null;
  categories: Category[] = [];
  categoryId: number | null = null;
  newCategoryName: string = '';
  selectedCategoryId: number | null = null;
  currentPostId: number | null = null;

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentPostId = +params['postId']; // Converte o postId para número
      console.log('Post ID atual:', this.currentPostId);

      // Chame loadCategories apenas se currentPostId não for null
      if (this.currentPostId !== null) {
        this.loadCategories(this.currentPostId); // Passa o currentPostId como argumento
      } else {
        console.error('currentPostId é null. Não é possível carregar categorias.');
      }
    });

    this.getUserId();
    this.setVisibility();
    this.handleQueryParams();
  }

  private getUserId(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.user_id = parseInt(storedUserId, 10);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private setVisibility(): void {
    this.visibility = this.authService.isLoggedIn() ? 'private' : 'public';
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
      }
    });
  }

  // Create a new post
  createPost(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.message = 'Title and content are required.';
      this.success = false;
      return;
    }

    if (!this.selectedCategoryId) {
      this.message = 'Category is required.';
      this.success = false;
      return;
    }

    const newPost: Post = {
      id: 0,
      title: this.title.trim(),
      content: this.content.trim(),
      user_id: this.user_id,
      visibility: this.visibility,
      categoryId: this.selectedCategoryId,
    };

    console.log('Criando post com dados:', newPost); // Log para depuração

    this.postService.createPost(newPost).subscribe({
      next: (response) => {
        console.log('Post criado com sucesso:', response);
        this.message = 'Post created successfully!';
        this.success = true;
        this.router.navigate(['/blog']);
      },
      error: (error) => this.onPostCreationError(error),
    });
  }

  private onPostCreationError(error: any): void {
    console.error('Error creating post:', error);
    this.message = error?.error?.message || 'Failed to create post.';
  }

  loadCategories(postId: number): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data; // Armazena as categorias
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    );
  }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const category: Omit<Category, 'id'> = {
        name: this.newCategoryName,
        postId: this.currentPostId, // Certifique-se de que postId esteja associado corretamente
      };

      this.categoryService.createCategory(category).subscribe({
        next: () => {
          // Passa o currentPostId ao chamar loadCategories
          if (this.currentPostId !== null) {
            this.loadCategories(this.currentPostId);
          } else {
            console.error('currentPostId is null. Cannot load categories.');
          }
          this.newCategoryName = ''; // Limpa o campo após a adição
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
    this.newCategoryName = category.name;
    this.selectedCategoryId = category.id !== undefined ? category.id : null;
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          // Verifica se currentPostId não é null antes de chamar loadCategories
          if (this.currentPostId !== null) {
            this.loadCategories(this.currentPostId); // Passa o postId para recarregar as categorias
          } else {
            console.error('currentPostId is null. Cannot load categories after deletion.');
          }

          this.message = 'Category deleted successfully!';
          this.success = true;
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.message = 'Failed to delete category.';
        },
      });
    }
  }

  private onCategoryAddError(error: any): void {
    console.error('Error adding category:', error);
    this.message = 'Failed to add category.';
  }

  onCategoryChange(categoryId: number): void {
    console.log('Categoria selecionada:', categoryId);
  }
}
