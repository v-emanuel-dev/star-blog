import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  postId!: number; // ID do post
  post!: Post; // O post que será exibido
  message: string = ''; // Mensagem de erro ou sucesso

  constructor(private route: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    console.log('Post ID:', this.postId); // Log do ID do post
    this.postService.getPostById(this.postId).subscribe((post: Post) => {
      this.post = post;
      console.log('Post encontrado:', this.post); // Log do post encontrado
    }, error => {
      console.error('Erro ao buscar o post:', error); // Log de erro
    });
  }

}
