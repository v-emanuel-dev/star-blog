import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css'],
})
export class BlogEditComponent implements OnInit {
  postId!: number;
  title: string = '';
  content: string = '';
  userId!: number;
  visibility: 'public' | 'private' = 'public';
  message: string | null = null;
  success: boolean = false;
  selectedCategoryIds: number[] = [];
  categories: Category[] = [];
  newCategoryName: string = '';
  currentPostId: number | null = null;
  post: Post;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.post = {
      id: 0,
      title: '',
      content: '',
      categories: [],
      user_id: 0,
      visibility: ''
    };
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentPostId = +params['postId'];
      console.log('Post ID atual:', this.currentPostId);

      // Chame loadCategories independentemente do postId
      this.loadCategories();
    });

    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
    this.userId = this.authService.getLoggedUserId() ?? 0;
  }

  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe({
      next: (post: Post) => {
        this.title = post.title;
        this.content = post.content;
        this.visibility = post.visibility as 'public' | 'private';
        this.selectedCategoryIds = post.categoryIds || [];
      },
      error: () => {
        this.message = 'Failed to load post.';
        this.success = false;
        this.router.navigate(['/blog']);
      },
    });
  }

  updatePost(): void {
    const updatedPost: Post = {
      id: this.postId,
      title: this.title,
      content: this.content,
      user_id: this.userId,
      visibility: this.visibility,
      created_at: new Date().toISOString(),
      username: '',
      categoryIds: this.selectedCategoryIds,
    };

    this.postService.updatePost(this.postId, updatedPost).subscribe(
      () => {
        this.message = 'Update successful!';
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/blog']);
        }, 1500);
      },
      (error) => {
        console.error('Error updating post:', error);
        this.message = 'Failed to update post.';
        this.success = false;
      }
    );
  }

  // Atualizado para usar getAllCategories como no BlogCreateComponent
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
        console.log('Categorias carregadas:', this.categories);
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
        postId: this.currentPostId,
      };

      this.categoryService.createCategory(category).subscribe({
        next: () => {
          this.loadCategories();
          this.newCategoryName = '';
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
    this.selectedCategoryIds = category.id !== undefined ? [category.id] : [];
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.loadCategories();
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

  onCategoryChange(event: Event, categoryId: number): void {
    event.preventDefault();

    const isChecked = this.selectedCategoryIds.includes(categoryId);

    if (isChecked) {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }

    console.log('Categorias selecionadas:', this.selectedCategoryIds);
  }
}
