import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../../models/post.model';
import { Comment } from '../../../models/comment.model';
import { Category } from '../../../models/category.model';
import { User } from '../../../models/user.model';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { CategoryService } from '../../../services/category.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  selectedTab: 'posts' | 'comments' | 'categories' | 'users' = 'posts';
  posts$: Observable<Post[]>;
  comments$: Observable<Comment[]>;
  categories$: Observable<Category[]>;
  users$: Observable<User[]>;
  loading = false;
  message: string | null = null;
  editingUser: User | null = null;
  editingPost: Post | null = null;
  editingComment: Comment | null = null;
  editingCategory: Category | null = null;

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {
    this.users$ = this.userService.users$;
    this.posts$ = this.postService.posts$;
    this.comments$ = this.commentService.comments$;
    this.categories$ = this.categoryService.categories$;
  }

  ngOnInit() {
    console.log('ngOnInit called');
    this.loadUsers();

    this.loadPosts(); // Chama loadPosts para carregar posts
    this.postService.posts$.subscribe((posts) => {
      console.log('Posts from BehaviorSubject:', posts);
      // Atualize a sua lista de posts, se necessário
    });

    this.loadComments();
    this.loadCategories();
  }

  changeTab(tab: 'posts' | 'comments' | 'categories' | 'users') {
    this.selectedTab = tab;
  }

  // Métodos para Users
  loadUsers(): void {
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

  deleteUser(userId: number): void {
    console.log('Attempting to delete user with ID:', userId);
    this.loading = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('User deleted successfully:', userId);
        this.message = 'User deleted successfully!';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.message = 'Failed to delete user.';
        this.loading = false;
      },
    });
  }

  startEditUser(user: User) {
    console.log('Editing user:', user);
    this.editingUser = { ...user };
  }

  saveEditUser() {
    if (this.editingUser) {
      console.log('Saving user:', this.editingUser);
      this.userService
        .updateUserAdmin(this.editingUser.id, this.editingUser)
        .subscribe({
          next: () => {
            console.log('User updated successfully:', this.editingUser);
            this.editingUser = null;
          },
          error: (err) => {
            console.error('Error updating user:', err);
          },
        });
    }
  }

  cancelEdit() {
    console.log('Edit canceled');
    this.editingUser = null;
  }

  // Métodos para Posts
  loadPosts(): void {
    console.log('Loading posts...');
    this.postService.getPostsAdmin().subscribe({
      next: (posts) => {
        console.log('Posts loaded successfully:', posts);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.message = 'Failed to load posts.';
        this.loading = false;
      },
    });
  }

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

  startEditPost(post: Post) {
    console.log('Editing post:', post);
    this.editingPost = { ...post };
  }

  saveEditPost() {
    if (this.editingPost) {
      // Verifica se o id é um número
      const postId = this.editingPost.id;

      if (postId !== undefined) {
        console.log('Saving post:', this.editingPost);
        this.postService.updatePost(postId, this.editingPost).subscribe({
          next: () => {
            console.log('Post updated successfully:', this.editingPost);
            this.editingPost = null;
          },
          error: (err) => {
            console.error('Error updating post:', err);
          },
        });
      } else {
        console.error('Post ID is undefined, cannot update post.');
      }
    } else {
      console.error('No post is being edited.');
    }
  }

  cancelPostEdit() {
    console.log('Post edit canceled');
    this.editingPost = null;
  }

  // Métodos para Comments
  loadComments(): void {
    console.log('Loading comments...');
    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        console.log('Comments loaded successfully:', comments);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.message = 'Failed to load comments.';
        this.loading = false;
      },
    });
  }

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

  startEditComment(comment: Comment) {
    console.log('Editing comment:', comment);
    this.editingComment = { ...comment };
  }

  saveEditComment() {
    if (this.editingComment) {
      // Verifica se o id é um número
      const commentId = this.editingComment.id;

      if (commentId !== undefined) {
        console.log('Saving comment:', this.editingComment);
        this.commentService
          .updateComment(commentId, this.editingComment)
          .subscribe({
            next: () => {
              console.log('Comment updated successfully:', this.editingComment);
              this.editingComment = null;
            },
            error: (err) => {
              console.error('Error updating comment:', err);
            },
          });
      } else {
        console.error('Comment ID is undefined, cannot update comment.');
      }
    } else {
      console.error('No comment is being edited.');
    }
  }

  cancelCommentEdit() {
    console.log('Comment edit canceled');
    this.editingComment = null;
  }

  // Métodos para Categories
  loadCategories(): void {
    console.log('Loading categories...');
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded successfully:', categories);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.message = 'Failed to load categories.';
        this.loading = false;
      },
    });
  }

  deleteCategory(categoryId: number): void {
    console.log('Attempting to delete category with ID:', categoryId);
    this.loading = true;
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        console.log('Category deleted successfully:', categoryId);
        this.message = 'Category deleted successfully!';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.message = 'Failed to delete category.';
        this.loading = false;
      },
    });
  }

  startEditCategory(category: Category) {
    console.log('Editing category:', category);
    this.editingCategory = { ...category };
  }

  saveEditCategory() {
    if (this.editingCategory) {
      // Verifica se o id é um número
      const categoryId = this.editingCategory.id;

      if (categoryId !== undefined) {
        console.log('Saving category:', this.editingCategory);
        this.categoryService
          .updateCategory(categoryId, this.editingCategory)
          .subscribe({
            next: () => {
              console.log(
                'Category updated successfully:',
                this.editingCategory
              );
              this.editingCategory = null;
            },
            error: (err) => {
              console.error('Error updating category:', err);
            },
          });
      } else {
        console.error('Category ID is undefined, cannot update category.');
      }
    } else {
      console.error('No category is being edited.');
    }
  }

  cancelCategoryEdit() {
    console.log('Category edit canceled');
    this.editingCategory = null;
  }
}
