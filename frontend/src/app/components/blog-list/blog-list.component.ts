import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { catchError, forkJoin, of } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Category } from '../../models/category.model';

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
  isLoadingCategories: boolean = true;
  categories: Category[] = []; // Array para armazenar as categorias

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCategories()
    this.route.queryParams.subscribe((params) => {
      const profileImageUrl = params['profileImage'];

      if (profileImageUrl) {
        this.userService.updateProfilePicture(profileImageUrl);
        console.log(
          'Profile image updated after Google login:',
          profileImageUrl
        );
      }
    });

    this.loadPostsAndCategories();
    this.getPosts(); // Carrega os posts na inicialização
    this.isLoggedIn = this.authService.isLoggedIn();

    // Verifica se há mensagens de erro nos parâmetros de consulta
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategoriesByPostId(this.postId).subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    );
  }

  toggleLike(postId: number): void {
    this.postService.toggleLike(postId).subscribe(
      (response) => {
        console.log(response);
        // Aqui, você deve atualizar a contagem de likes do post
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          post.likes = post.likes ? post.likes + 1 : 1; // Incrementa ou inicializa o número de likes
        }
      },
      (error) => {
        console.error('Error liking/disliking post:', error);
      }
    );
  }

  loadPostsAndCategories(): void {
    this.isLoadingCategories = true;

    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;

        // Cria uma lista de observables para buscar as categorias de cada post
        const categoryRequests = this.posts.map((post) => {
          if (post.id !== undefined) {
            return this.categoryService.getCategoriesByPostId(post.id).pipe(
              catchError((error) => {
                console.error(
                  `Error loading post categories ${post.id}:`,
                  error
                );
                return of([]); // Retorna um array vazio em caso de erro
              })
            );
          } else {
            return of([]);
          }
        });

        // Usa forkJoin para esperar todas as requisições de categorias
        forkJoin(categoryRequests).subscribe({
          next: (categoriesArray) => {
            categoriesArray.forEach((categories, index) => {
              this.posts[index].categories = categories;
            });
            this.isLoadingCategories = false;
            this.updatePostsTitle(); // Atualiza o título após carregar categorias
          },
          error: (error) => {
            console.error('Erro ao carregar as categorias:', error);
            this.isLoadingCategories = false;
          },
        });
      },
      error: (error) => {
        console.error('Erro ao carregar os posts:', error);
        this.isLoadingCategories = false;
      },
    });
  }

  getPosts(): void {
    this.loading = true;

    // Obter o papel do usuário, se já estiver disponível
    const userRole = localStorage.getItem('userRole'); // Exemplo de como recuperar o papel
    console.log('Retrieved user role from localStorage:', userRole);

    // Se o papel não estiver disponível, solicite-o ao AuthService
    if (!userRole) {
        this.authService.getUserRole().subscribe(
            (role) => {
                console.log('Fetched user role from AuthService:', role);
                if (role) {
                    localStorage.setItem('userRole', role); // Armazena o papel do usuário
                    this.loadPosts(role); // Chama loadPosts apenas se role não for null
                } else {
                    console.error('User role is null'); // Lida com o caso em que o papel é null
                    this.loading = false; // Para o carregamento em caso de erro
                }
            },
            (error) => {
                console.error('Error fetching user role:', error);
                this.loading = false; // Para o carregamento em caso de erro
            }
        );
    } else {
        this.loadPosts(userRole); // Carrega posts com o papel já armazenado
    }
}



private loadPosts(userRole: string): void {
  const isAdmin = userRole === 'admin';
  console.log('Loading posts. Is admin:', isAdmin);

  // Log do token do usuário
  const token = this.authService.getToken(); // Altere este método conforme sua implementação
  console.log('User token:', token);

  const postsObservable = isAdmin
    ? this.postService.getPostsAdmin()
    : this.postService.getPosts();

  postsObservable.subscribe({
      next: (data: Post[]) => {
          console.log('Posts fetched successfully:', data); // Loga os dados recebidos

          // Verifica se os dados são válidos
          if (!data || data.length === 0) {
              console.warn('No posts were fetched.'); // Aviso caso não sejam recebidos posts
          }

          this.posts = data;

          // Verifica se o usuário está logado
          console.log('Is user logged in:', this.isLoggedIn);

          // Filtra os posts com base no papel do usuário
          if (this.isLoggedIn) {
              console.log('User is logged in, displaying all posts.');
              this.filteredPosts = this.posts;
          } else {
              console.log('User is not logged in, filtering public posts.');
              this.filteredPosts = this.posts.filter((post) => post.visibility === 'public');
          }

          console.log('Filtered posts based on visibility:', this.filteredPosts); // Log para verificar posts filtrados

          this.updatePostsTitle();
          this.loading = false;
      },
      error: (error) => {
          console.error('Error fetching posts:', error);
          console.error('Error details:', error.message); // Log detalhado do erro
          this.loading = false;
      },
  });
}




  filterPosts(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredPosts = this.posts.filter((post) => {
      const matchesTitle = post.title.toLowerCase().includes(searchTermLower);
      const matchesContent = post.content
        .toLowerCase()
        .includes(searchTermLower);

      const matchesCategory =
        post.categories && Array.isArray(post.categories)
          ? post.categories.some((category) =>
              category.name.toLowerCase().includes(searchTermLower)
            )
          : false;

      return matchesTitle || matchesContent || matchesCategory;
    });

    this.updatePostsTitle(); // Atualiza o título após filtrar os posts
  }

  updatePostsTitle(): void {
    const hasPrivatePosts = this.filteredPosts.some(
      (post) => post.visibility === 'private'
    );
    const hasPublicPosts = this.filteredPosts.some(
      (post) => post.visibility === 'public'
    );

    // Verifica se o usuário é admin
    const isAdmin =
      this.authService.isLoggedIn() &&
      localStorage.getItem('userRole') === 'admin';

    // Atualiza o título com base na visibilidade dos posts e no papel do usuário
    if (isAdmin) {
      this.postsTitle = 'Admin Posts'; // Para admin, sempre mostra 'All Posts'
    } else if (hasPrivatePosts && hasPublicPosts) {
      this.postsTitle = 'Public and Private'; // Se houver posts públicos e privados
    } else if (hasPrivatePosts) {
      this.postsTitle = 'Private'; // Se houver apenas posts privados
    } else {
      this.postsTitle = 'Public'; // Se houver apenas posts públicos
    }
  }

  editPost(postId: number): void {
    this.router.navigate(['/blog/edit', postId]);
  }

  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.getPosts(); // Atualiza a lista de posts após a exclusão
        this.message = 'Post deleted successfully!';
        this.success = true;
      },
      error: (err) => {
        console.error('Error deleting post:', err); // Exibe o erro detalhado no console
        this.message = 'Failed to delete post.';
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
    this.message = 'Text exported successfully!';
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
          this.message = 'Post deleted successfully!';
          this.success = true;
          this.closeModal(); // Fecha o modal após a deleção
        },
        error: (err) => {
          console.error('Error deleting post:', err); // Exibe o erro detalhado no console
          this.message = 'Failed to delete post.';
          this.success = false;
        },
        complete: () => {
          setTimeout(() => {
            this.message = ''; // Limpa a mensagem após um tempo
          }, 2000);
        },
      });
    } else {
      console.error('Post ID is not valid:', postId);
    }
  }
}
