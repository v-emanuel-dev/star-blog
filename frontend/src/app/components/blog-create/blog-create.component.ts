import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model'; // Ajuste o caminho conforme necessário
import { PostService } from '../../services/post.service'; // Ajuste o caminho conforme necessário
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html', // Ajuste o caminho conforme necessário
  styleUrls: ['./blog-create.component.css'], // Ajuste o caminho conforme necessário
})
export class BlogCreateComponent implements OnInit {
  title: string = ''; // Campo para armazenar o título do post
  content: string = ''; // Campo para armazenar o conteúdo do post
  message: string = ''; // Para armazenar a mensagem a ser exibida
  success: boolean = false; // Para indicar sucesso ou falha
  visibility: string = 'public'; // Valor padrão
  userId: number = 0; // Inicializa com 0 como valor padrão

  constructor(
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService // Serviço de autenticação
  ) {}

  ngOnInit(): void {
    // Obtém o ID do usuário logado a partir do localStorage
    const storedUserId = localStorage.getItem('userId');

    // Verifica se o userId existe e é válido
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10); // Converte de string para número
    } else {
      // Redireciona para o login ou trata de outra forma
      this.router.navigate(['/login']);
    }

    if (!this.authService.isLoggedIn()) {
      this.visibility = 'public'; // Apenas público se não estiver logado
    }

    // Manipula parâmetros de consulta, se necessário
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false; // Define sucesso como falso para mensagens de erro
      }
    });
  }

  // Método para criar um novo post
  createPost(): void {
    // Validação dos campos
    if (!this.title.trim() || !this.content.trim() || this.title.length < 3) {
      this.message =
        'Title and content cannot be empty and Title must be at least 3 characters!';
      this.success = false;
      return;
    }

    const newPost: Post = {
      id: 0, // ID temporário, será atribuído pelo servidor
      title: this.title, // Atribui o título
      content: this.content, // Atribui o conteúdo
      userId: this.userId, // Atribui o ID do usuário logado
      visibility: this.visibility, // Atribui a visibilidade selecionada
    };

    // Chama o serviço para criar o post
    this.postService.createPost(newPost).subscribe({
      next: () => {
        this.message = 'Post created successfully!'; // Mensagem de sucesso
        this.success = true; // Indica sucesso
        setTimeout(() => {
          this.router.navigate(['/blog']); // Navega para a lista de blogs após a criação
        }, 1500); // Redireciona após um atraso
      },
      error: (error) => {
        console.error('Error creating post:', error); // Registra o erro
        this.message = error?.error?.message || 'Failed to create post.'; // Define a mensagem de erro
        this.success = false; // Indica falha
      },
    });
  }
}
