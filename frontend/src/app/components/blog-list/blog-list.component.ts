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
  postId: number = 0;
  filteredPosts: Post[] = []; // Posts filtrados pela busca
  searchTerm: string = ''; // Termo de busca
  success: boolean = false; // Status de sucesso ou falha das ações
  isLoggedIn: boolean = false; // Verifica se o usuário está logado
  loading: boolean = true; // Indicador de carregamento
  postsTitle: string = ''; // Título dos posts
  isModalOpen: boolean = false;
  currentPostId: number | null = null;
  message: string | null = null; // Mensagem a ser exibida

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService // Injete o serviço de categorias
  ) {}

  ngOnInit(): void {
    this.getPosts(); // Carrega os posts na inicialização
    this.isLoggedIn = this.authService.isLoggedIn();

    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false;
      }
    });
  }

  getPosts(): void {
    this.loading = true; // Ativa o carregamento

    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        // Simula um atraso de 2 segundos para visualizar a animação de loading
        setTimeout(() => {
          this.posts = data;

          // Carregar categorias para cada post (usando categoryIds)
          this.posts.forEach((post) => {
            if (post.id !== undefined) {
              this.categoryService.getCategoriesByPostId(post.id).subscribe(
                (categories: Category[]) => {
                  post.categories = categories; // Armazena categorias diretamente no post
                },
                (error) => {
                  console.error(`Erro ao obter categorias para o post ${post.id}:`, error);
                }
              );
            } else {
              console.warn(`post.id está indefinido para um post:`, post);
            }
          });

          this.filteredPosts = this.isLoggedIn
            ? data
            : data.filter((post) => post.visibility === 'public');

          this.updatePostsTitle();
          this.loading = false; // Finaliza o carregamento após o atraso
        }, 2000); // Tempo em milissegundos (2 segundos)
      },
      (error) => {
        console.error('Erro ao obter posts:', error);
        this.loading = false; // Finaliza o carregamento mesmo em caso de erro
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
