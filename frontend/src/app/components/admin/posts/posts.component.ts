import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent {
  posts$: Observable<Post[]>;
  loading: boolean = true;
  message: string | null = null;
  editingPost: Post | null = null;

  constructor(private postService: PostService) {
    this.posts$ = this.postService.posts$;
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts(): void {
    console.log('Loading posts...');
    this.postService.getPosts().subscribe({
      next: (posts) => {
        console.log('Posts loaded:', posts); // Loga os posts recebidos
        this.loading = false; // Define loading como false
        // Aqui, adicione uma lógica para lidar com a atualização dos posts no componente
        if (posts.length === 0) {
          this.message = 'No posts available.'; // Mensagem se não houver posts
        } else {
          this.message = null; // Limpa a mensagem se houver posts
        }
      },
      error: (error) => {
        console.error('Error loading posts:', error); // Log de erro
        this.loading = false; // Define loading como false
        this.message = 'Error loading posts.'; // Mensagem de erro
      }
    });
  }


  deletePost(postId: number | undefined): void {
    if (postId === undefined) {
      console.warn('Post ID is undefined, cannot delete.');
      return;
    }

    this.loading = true;
    this.postService.deletePost(postId).subscribe(
      () => {
        this.message = 'Post deleted successfully!';
        this.loadPosts(); // Opcional: recarrega os posts após a deleção
        this.loading = false;
      },
      (error) => {
        console.error('Error deleting post:', error);
        this.message = 'Failed to delete post.';
        this.loading = false;
      }
    );
  }


  startEditPost(post: Post) {
    this.editingPost = { ...post };
  }

  saveEditPost() {
    if (this.editingPost && this.editingPost.id !== undefined) {
      this.postService.updatePost(this.editingPost.id, this.editingPost).subscribe(
        () => {
          this.message = 'Post updated successfully!';
          this.loadPosts(); // Opcional: recarrega os posts após a atualização
        },
        (error) => {
          console.error('Error updating post:', error);
          this.message = 'Failed to update post.';
        }
      );
      this.editingPost = null; // Limpa a edição após o salvamento
    } else {
      console.warn('Editing post is not defined or does not have an ID.');
      this.message = 'Failed to update post. ID is missing.';
    }
  }

  cancelEdit() {
    this.editingPost = null;
  }
}
