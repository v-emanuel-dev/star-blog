import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {
  postId!: number; // To store the ID of the post being edited
  title: string = ''; // Field to store the post title
  content: string = ''; // Field to store the post content
  message: string = ''; // To hold the message to display
  success: boolean = false; // To indicate success or failure

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the post ID from the route parameters
    this.postId = +this.route.snapshot.paramMap.get('id')!;

    // Fetch the post by ID and set the title and content
    this.postService.getPostById(this.postId).subscribe((post: Post) => {
      this.title = post.title;
      this.content = post.content;
    });
  }

  // Method to update the post
  updatePost(): void {
    const updatedPost: Post = { title: this.title, content: this.content };

    this.postService.updatePost(this.postId, updatedPost).subscribe(() => {
      this.message = 'Update successful!'; // Success message
      this.success = true; // Indicate success
      setTimeout(() => {
        this.router.navigate(['/blog']); // Redirect to the blog list after a short delay
      }, 1500); // Wait for 1.5 seconds before redirecting
    }, error => {
      console.error('Error updating post:', error); // Log error
      this.message = 'Failed to update post.'; // Set error message
      this.success = false; // Indicate failure
    });
  }
}
