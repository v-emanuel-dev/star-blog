import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CategoryService } from '../../../services/category.service';
import { CommentService } from '../../../services/comment.service';
import { PostService } from '../../../services/post.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'], // Corrigi 'styleUrl' para 'styleUrls'
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  editingUser: any = null;
  categories: any[] = [];
  editingCategory: any = null;
  comments: any[] = [];
  editingComment: any = null;
  posts: any[] = [];
  editingPost: any = null;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private commentService: CommentService,
    private postService: PostService
  ) {
    console.log('UsersComponent instantiated');
  }

  ngOnInit() {
    console.log('ngOnInit called');
    this.loadUsers();
    this.loadCategories();
    this.loadComments();
    this.loadPosts();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error loading users:', error); // Log para erros
      }
    );
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(
      (categories) => {
        this.categories = categories;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  loadComments() {
    this.commentService.getAllComments().subscribe(
      (comments) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Error loading comments:', error);
      }
    );
  }

  loadPosts() {
    this.postService.getPosts().subscribe(
      posts => {
        this.posts = posts;
      },
      error => {
        console.error('Error loading posts:', error);
      }
    );
  }

  startEditUser(user: any) {
    console.log('Editing user:', user); // Log do usuário que está sendo editado
    this.editingUser = { ...user };
  }

  saveEditUser() {
    if (this.editingUser) {
      console.log('Saving user:', this.editingUser); // Log do usuário que está sendo salvo
      this.userService
        .updateUserAdmin(this.editingUser.id, this.editingUser)
        .subscribe(
          () => {
            console.log('User updated successfully:', this.editingUser); // Log de sucesso na atualização
            this.loadUsers();
            this.editingUser = null;
          },
          (error) => {
            console.error('Error updating user:', error); // Log de erro na atualização
          }
        );
    }
  }

  cancelEditUser() {
    console.log('Edit canceled for user:', this.editingUser); // Log do cancelamento da edição
    this.editingUser = null;
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        console.log('User deleted successfully:', response);
        // Atualiza a lista de usuários após a deleção
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
      },
    });
  }

  startEditCategory(category: any) {
    console.log('Editing category:', category);
    this.editingCategory = { ...category };
  }

  saveEditCategory() {
    if (this.editingCategory) {
      console.log('Saving category:', this.editingCategory);
      this.categoryService.updateCategory(this.editingCategory.id, this.editingCategory)
        .subscribe(() => {
          console.log('Category updated successfully:', this.editingCategory);
          this.loadCategories();
          this.editingCategory = null;
        }, error => {
          console.error('Error updating category:', error);
        });
    }
  }

  deleteCategory(id: number) {
    this.categoryService.deleteCategory(id).subscribe({
      next: (response) => {
        console.log('Category deleted successfully:', response);
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
      },
    });
  }

  cancelEditCategory() {
    console.log('Edit canceled for category:', this.editingCategory); // Log do cancelamento da edição
    this.editingCategory = null;
  }

  startEditComment(comment: any) {
    console.log('Editing comment:', comment);
    this.editingComment = { ...comment };
  }

  saveEditComment() {
    if (this.editingComment) {
      console.log('Saving comment:', this.editingComment);
      this.commentService.updateComment(this.editingComment.id, this.editingComment)
        .subscribe(() => {
          console.log('Comment updated successfully:', this.editingComment);
          this.loadComments();
          this.editingComment = null;
        }, error => {
          console.error('Error updating comment:', error);
        });
    }
  }

  cancelEditComment() {
    console.log('Edit canceled for comment:', this.editingComment);
    this.editingComment = null;
  }

  deleteComment(id: number) {
    this.commentService.deleteComment(id).subscribe({
      next: (response) => {
        console.log('Comment deleted successfully:', response);
        this.loadComments();
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
      },
    });
  }

  startEditPost(post: any) {
    console.log('Editing post:', post);
    this.editingPost = { ...post };
  }

  saveEditPost() {
    if (this.editingPost) {
      console.log('Saving post:', this.editingPost);
      this.postService.updatePost(this.editingPost.id, this.editingPost)
        .subscribe(() => {
          console.log('Post updated successfully:', this.editingPost);
          this.loadPosts();
          this.editingPost = null;
        }, error => {
          console.error('Error updating post:', error);
        });
    }
  }

  cancelEditPost() {
    console.log('Edit canceled for post:', this.editingPost);
    this.editingPost = null;
  }

  deletePost(id: number) {
    this.postService.deletePost(id).subscribe({
      next: (response) => {
        console.log('Post deleted successfully:', response);
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error deleting post:', err);
      },
    });
  }

}
