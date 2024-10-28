import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Category } from '../../models/category.model';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';

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
  role: string = 'user';
  selectedCategoryIds: number[] = [];
  categories: Category[] = [];
  newCategoryName: string = '';
  currentPostId: number | null = null;
  post: Post;
  isModalOpen = false;
  currentCategoryId: number | null = null;
  editorContent: string = '';

  public Editor = ClassicEditor.default;
  public blogEditorContent: string = '';
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'imageUpload',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      '|',
      'undo',
      'redo',
    ],
  };

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.post = {
      id: 0,
      title: '',
      content: '',
      categories: [],
      user_id: 0,
      visibility: '',
      role: '',
      likes: 0,
    };
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const postIdParam = params['id'];
      this.postId = +postIdParam;
      if (isNaN(this.postId)) {
        return;
      }
      this.loadPost();
      this.loadCategories();
      this.loadCategoriesByPostId(this.postId);
    });

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
        this.openSnackBar('Failed to load post.');
        this.router.navigate(['/blog']);
      },
    });
  }

  public onReady(editor: any): void {
    delete editor.plugins.get('FileRepository').createUploadAdapter;
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
      role: this.role,
      likes: this.post.likes || 0,
    };

    this.postService.updatePost(this.postId, updatedPost).subscribe(
      () => {
        this.openSnackBar('Update successful!');
        setTimeout(() => {
          this.router.navigate(['/blog']);
        }, 1500);
      },
      (error) => {
        this.openSnackBar('Failed to update post.');
      }
    );
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
        this.loadCategoriesByPostId(this.postId);
      },
      (error) => {
        this.openSnackBar('Error retrieving all categories:');
      }
    );
  }

  loadCategoriesByPostId(postId: number): void {
    this.categoryService.getCategoriesByPostId(postId).subscribe(
      (data: Category[]) => {
        this.selectedCategoryIds = data.map((cat) => cat.id!);
      },
      (error) => {
        this.openSnackBar('Error retrieving categories:');
      }
    );
  }

  onCategoryChange(event: Event, categoryId: number): void {
    event.preventDefault();
    const isChecked = this.selectedCategoryIds.includes(categoryId);

    if (isChecked) {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(
        (id) => id !== categoryId
      );
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
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
      });
    }
  }

  editCategory(category: Category): void {
    this.newCategoryName = category.name;
    this.selectedCategoryIds = category.id !== undefined ? [category.id] : [];
  }

  deleteCategory(categoryId: number): void {
    if (categoryId) {
      this.openModal(categoryId);
    }
  }

  deleteCategoryModal(categoryId: number): void {
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.loadCategories();
        this.openSnackBar('Category deleted successfully!');
        this.closeModal();
      },
      error: (error) => {
        this.openSnackBar('Failed to delete category.');
      },
      complete: () => {
        setTimeout(() => {}, 2000);
      },
    });
  }

  confirmDelete(categoryId: number): void {
    this.openModal(categoryId);
  }

  openModal(categoryId: number): void {
    this.currentCategoryId = categoryId;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentCategoryId = null;
  }

  private openSnackBar(
    message: string,
    action: string = 'Close',
    duration: number = 3000
  ): void {
    this.snackBar.open(message, action, {
      panelClass: ['star-snackbar'],
      duration: duration,
    });
  }
}
