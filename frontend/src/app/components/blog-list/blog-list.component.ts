import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model'; // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
})
export class BlogListComponent implements OnInit {
  posts: Post[] = []; // Todos os posts
  filteredPosts: Post[] = []; // Posts filtrados pela busca
  searchTerm: string = ''; // Termo de busca
  message: string = ''; // Mensagem para feedback ao usuário
  success: boolean = false; // Status de sucesso ou falha das ações
  isLoggedIn: boolean = false; // Verifica se o usuário está logado
  loading: boolean = true; // Indicador de carregamento
  postsTitle: string = ''; // Título dos posts
  categories: Category[] = []; // Armazena categorias
  isModalOpen: boolean = false;
  currentPostId: number | null = null;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService // Injete o serviço de categorias
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.getPosts(); // Carrega os posts na inicialização
    this.getCategories(); // Carregue as categorias

    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false;
      }
    });
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data; // Armazena as categorias
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    );
  }

  getPosts(): void {
    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        this.posts = data;
        this.filteredPosts = this.isLoggedIn
          ? data
          : data.filter((post) => post.visibility === 'public');

        // Atualize o título dos posts após carregar
        this.updatePostsTitle();
        this.loading = false; // Finaliza o carregamento
      },
      (error) => {
        console.error('Erro ao obter posts:', error);
        this.loading = false; // Finaliza o carregamento, mesmo em erro
      }
    );
  }

  filterPosts(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter((post) => {
      const matchesSearchTerm =
        post.title.toLowerCase().includes(searchTermLower) ||
        post.content.toLowerCase().includes(searchTermLower);
      return matchesSearchTerm; // Não filtre pela visibilidade aqui
    });

    // Atualize o título dos posts após filtrar
    this.updatePostsTitle();
  }

  updatePostsTitle(): void {
    const hasPublicPosts = this.filteredPosts.some(
      (post) => post.visibility === 'public'
    );
    this.postsTitle = hasPublicPosts ? 'Public Posts' : 'Private Posts'; // Atualiza o título baseado na visibilidade
  }

  editPost(postId: number): void {
    this.router.navigate(['/blog/edit', postId]);
  }

  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.getPosts(); // Atualiza a lista de posts após a exclusão
        this.message = 'Post deletado com sucesso!';
        this.success = true;
      },
      error: (err) => {
        console.error('Erro ao deletar post:', err); // Exibe o erro detalhado no console
        this.message = 'Falha ao deletar o post.';
        this.success = false;
      },
      complete: () => {
        setTimeout(() => {
          this.message = '';
        }, 2000);
      },
    });
  }

  exportAsTxt(post: Post): void {
    const content = `Título: ${post.title}\n\nConteúdo:\n${post.content}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${post.title}.txt`);
    this.message = 'Texto exportado com sucesso!';
    this.success = true;
    setTimeout(() => {
      this.message = '';
    }, 2000);
  }

  logNavigation(postId: number): void {
    console.log('Navigating to post ID:', postId);
  }

  // Método para abrir o modal
  openModal(postId: number): void {
    this.currentPostId = postId; // Armazena o ID do post a ser deletado
    this.isModalOpen = true; // Abre o modal
  }

  // Método para fechar o modal
  closeModal(): void {
    this.isModalOpen = false; // Fecha o modal
    this.currentPostId = null; // Limpa o ID atual
  }

  // Método de confirmação de deleção
  confirmDelete(postId: number): void {
    this.openModal(postId); // Abre o modal com o ID do post
  }

  // Método para deletar o post
  deletePostModal(postId: number): void {
    if (postId) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.getPosts(); // Atualiza a lista de posts após a exclusão
          this.message = 'Post deletado com sucesso!';
          this.success = true;
          this.closeModal(); // Fecha o modal após a deleção
        },
        error: (err) => {
          console.error('Erro ao deletar post:', err); // Exibe o erro detalhado no console
          this.message = 'Falha ao deletar o post.';
          this.success = false;
        },
        complete: () => {
          setTimeout(() => {
            this.message = ''; // Limpa a mensagem após um tempo
          }, 2000);
        },
      });
    } else {
      console.error('ID do post não é válido:', postId);
    }
  }
}
