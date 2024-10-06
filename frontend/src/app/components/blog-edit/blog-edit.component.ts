import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service'; // Importe o AuthService

@Component({
  selector: 'app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {
  postId!: number; // Para armazenar o ID do post sendo editado
  title: string = ''; // Campo para armazenar o título do post
  content: string = ''; // Campo para armazenar o conteúdo do post
  userId!: number; // Para armazenar o ID do usuário logado
  visibility: "public" | "private" = "public"; // Inicializa como público
  message: string = ''; // Para armazenar a mensagem a ser exibida
  success: boolean = false; // Para indicar sucesso ou falha

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Injete o AuthService
  ) {}

  ngOnInit(): void {
    // Obtém o ID do post a partir dos parâmetros da rota
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
    this.userId = this.authService.getLoggedUserId() ?? 0;
  }

  // Método para carregar o post
  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe({
      next: (post: Post) => {
        this.title = post.title;
        this.content = post.content;
        this.visibility = post.visibility as "public" | "private";
      },
      error: () => {
        this.message = 'Failed to load post.';
        this.success = false;
        this.router.navigate(['/blog']); // Redireciona se falhar ao carregar
      }
    });
  }

  // Método para atualizar o post
  updatePost(): void {
    const updatedPost: Post = {
      title: this.title,
      content: this.content,
      userId: this.userId,  // Adicione o userId aqui
      visibility: this.visibility // Adicione a visibilidade (pública ou privada)
    };

    this.postService.updatePost(this.postId, updatedPost).subscribe(() => {
      this.message = 'Update successful!'; // Mensagem de sucesso
      this.success = true; // Indica sucesso
      setTimeout(() => {
        this.router.navigate(['/blog']); // Redireciona para a lista de blogs após um curto atraso
      }, 1500); // Aguarda 1,5 segundos antes de redirecionar
    }, error => {
      console.error('Error updating post:', error); // Loga o erro
      this.message = 'Failed to update post.'; // Define a mensagem de erro
      this.success = false; // Indica falha
    });
  }
}
