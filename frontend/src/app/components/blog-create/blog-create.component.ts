import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model'; // Adjust the path as needed
import { PostService } from '../../services/post.service'; // Adjust the path as needed

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html', // Adjust the path as needed
  styleUrls: ['./blog-create.component.css'] // Adjust the path as needed
})
export class BlogCreateComponent implements OnInit {
  title: string = ''; // Field to store the post title
  content: string = ''; // Field to store the post content
  message: string = ''; // To hold the message to display
  success: boolean = false; // To indicate success or failure

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false; // Set success to false for error messages
      }
    });
  }

  // Method to create a new post
  createPost(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.message = 'Title and content cannot be empty!'; // Error message
      this.success = false; // Indicate failure
      return; // Exit if validation fails
    }

    const newPost: Post = {
      id: 0, // Temporary ID, will be assigned by the server
      title: this.title, // Assign title
      content: this.content // Assign content
    };

    this.postService.createPost(newPost).subscribe({
      next: () => {
        this.message = 'Post created successfully!'; // Success message
        this.success = true; // Indicate success
        setTimeout(() => {
          this.router.navigate(['/blog']); // Navigate to the blog list after creation
        }, 1500); // Redirect after delay
      },
      error: (error) => {
        console.error('Error creating post:', error); // Log error
        this.message = error?.error?.message || 'Failed to create post.'; // Set error message
        this.success = false; // Indicate failure
      }
    });
  }
}
