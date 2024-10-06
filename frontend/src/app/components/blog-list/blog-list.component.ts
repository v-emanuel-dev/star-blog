import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

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
  postsTitle: string = ''; // Adicione esta linha para declarar postsTitle

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('BlogListComponent initialized');
    this.isLoggedIn = this.authService.isLoggedIn();
    this.getPosts(); // Carrega os posts na inicialização

    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false;
      }
    });
  }

  getPosts(): void {
    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        console.log(data); // Verifique a estrutura e a visibilidade dos posts
        this.posts = data;

        if (this.isLoggedIn) {
          // Se o usuário está logado, mostra todos os posts
          this.filteredPosts = data;
        } else {
          // Se não estiver logado, mostra apenas posts públicos
          this.filteredPosts = data.filter(
            (post) => post.visibility === 'public'
          );
        }

        // Atualize o título dos posts após carregar
        this.updatePostsTitle();
      },
      (error) => {
        console.error('Erro ao obter posts:', error);
        // Trate o erro aqui, se necessário
      }
    );
  }

  filterPosts(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter((post) => {
      const matchesSearchTerm =
        post.title.toLowerCase().includes(searchTermLower) ||
        post.content.toLowerCase().includes(searchTermLower);
      const matchesVisibility = this.isLoggedIn || post.visibility === 'public';
      return matchesSearchTerm && matchesVisibility; // Retorna apenas posts que correspondem ao termo de busca e à visibilidade
    });

    // Atualize o título dos posts após filtrar
    this.updatePostsTitle();
  }

  updatePostsTitle() {
    const hasPublicPosts = this.filteredPosts.some(post => post.visibility === 'public');
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
      error: () => {
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

  confirmDelete(postId: number): void {
    if (confirm('Tem certeza que deseja deletar este post?')) {
      this.deletePost(postId);
    }
  }
}
