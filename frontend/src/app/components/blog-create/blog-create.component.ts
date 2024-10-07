import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model'; // Adjust the path as needed
import { PostService } from '../../services/post.service'; // Adjust the path as needed
import { AuthService } from '../../services/auth.service'; // Adjust the path as needed
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model'; // Adjust the path as needed

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html', // Adjust the path as needed
  styleUrls: ['./blog-create.component.css'], // Adjust the path as needed
})
export class BlogCreateComponent implements OnInit {
  title: string = ''; // Store the post title
  content: string = ''; // Store the post content
  message: string = ''; // Message to be displayed
  success: boolean = false; // Indicates success or failure
  visibility: string = 'public'; // Default value
  userId: number = 0; // Initialize with 0 as default value
  categories: Category[] = []; // Category array with type annotation
  newCategoryName: string = ''; // New category name
  selectedCategoryId: number | null = null; // Selected category ID

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getUserId();
    this.setVisibility();
    this.handleQueryParams();
  }

  // Fetch logged-in user's ID from localStorage
  private getUserId(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10); // Convert from string to number
    } else {
      this.router.navigate(['/login']); // Redirect to login if user ID is invalid
    }
  }

  // Set visibility based on user authentication status
  private setVisibility(): void {
    if (!this.authService.isLoggedIn()) {
      this.visibility = 'public'; // Only public if not logged in
    }
  }

  // Handle query parameters if necessary
  private handleQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
      }
    });
  }

  // Create a new post
  createPost(): void {
    if (!this.isPostValid()) {
      return; // Return early if validation fails
    }

    const newPost: Post = {
      id: 0, // Temporary ID, will be assigned by the server
      title: this.title,
      content: this.content,
      userId: this.userId,
      visibility: this.visibility,
      created_at: new Date().toISOString(),
      username: '',
      categoryId: 0
    };

    this.postService.createPost(newPost).subscribe({
      next: () => this.onPostCreationSuccess(),
      error: (error) => this.onPostCreationError(error),
    });
  }

  // Validate post fields
  private isPostValid(): boolean {
    if (!this.title.trim() || !this.content.trim() || this.title.length < 3) {
      this.message = 'Title and content cannot be empty, and title must be at least 3 characters!';
      return false;
    }
    return true; // Post is valid
  }

  // Handle successful post creation
  private onPostCreationSuccess(): void {
    this.message = 'Post created successfully!';
    this.success = true;
    setTimeout(() => {
      this.router.navigate(['/blog']); // Navigate to the blog list after creation
    }, 1500);
  }

  // Handle post creation error
  private onPostCreationError(error: any): void {
    console.error('Error creating post:', error);
    this.message = error?.error?.message || 'Failed to create post.';
  }

  // Get categories
  getCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => this.categories = data,
      (error) => {
        console.error('Error fetching categories:', error);
        this.message = 'Failed to load categories.';
      }
    );
  }

  // Add a new category
  addCategory(): void {
    if (this.newCategoryName.trim()) {
      this.categoryService.createCategory(this.newCategoryName).subscribe({
        next: () => this.onCategoryAddSuccess(),
        error: (error) => this.onCategoryAddError(error),
      });
    }
  }

  // Handle successful category addition
  private onCategoryAddSuccess(): void {
    this.getCategories(); // Refresh categories
    this.newCategoryName = ''; // Clear input
    this.message = 'Category added successfully!';
    this.success = true;
  }

  // Handle category addition error
  private onCategoryAddError(error: any): void {
    console.error('Error adding category:', error);
    this.message = 'Failed to add category.';
  }

  // Edit a category
  editCategory(category: Category): void {
    const updatedName = prompt('Enter new category name:', category.name);
    if (updatedName) {
      this.categoryService.updateCategory(category.id, { id: category.id, name: updatedName }).subscribe({
        next: (updatedCategory) => this.onCategoryEditSuccess(category.id, updatedCategory),
        error: (error) => this.onCategoryEditError(error),
      });
    }
  }

  // Handle successful category update
  private onCategoryEditSuccess(id: number, updatedCategory: Category): void {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.categories[index] = updatedCategory; // Replace with the updated category
    }
    this.message = 'Category updated successfully!';
    this.getCategories(); // Refresh categories after update
  }

  // Handle category update error
  private onCategoryEditError(error: any): void {
    console.error('Error updating category:', error);
    this.message = 'Failed to update category.';
  }

  // Delete a category
  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.onCategoryDeleteSuccess(),
      error: (error) => this.onCategoryDeleteError(error),
    });
  }

  // Handle successful category deletion
  private onCategoryDeleteSuccess(): void {
    this.getCategories(); // Refresh categories
    this.message = 'Category deleted successfully!';
    this.success = true;
  }

  // Handle category deletion error
  private onCategoryDeleteError(error: any): void {
    console.error('Error deleting category:', error);
    this.message = 'Failed to delete category.';
  }
}
