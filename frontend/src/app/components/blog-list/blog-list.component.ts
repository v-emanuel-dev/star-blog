import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  posts: Post[] = []; // Todos os posts
  filteredPosts: Post[] = []; // Posts filtrados pela busca
  searchTerm: string = ''; // Termo de busca
  message: string = ''; // Mensagem para feedback ao usuário
  success: boolean = false; // Status de sucesso ou falha das ações

  constructor(private postService: PostService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getPosts(); // Carrega os posts na inicialização
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.message = params['message'];
        this.success = false;
      }
    });
  }

  getPosts(): void {
    this.postService.getPosts().subscribe((data: Post[]) => {
      this.posts = data; // Atribui os posts recebidos
      this.filteredPosts = data; // Inicialmente, todos os posts são exibidos
    });
  }

  // Método de busca para filtrar os posts por título e conteúdo
  filterPosts(): void {
    const searchTermLower = this.searchTerm.toLowerCase(); // Transforma o termo de busca em minúsculas
    if (this.searchTerm) {
      this.filteredPosts = this.posts.filter(post =>
        post.title.toLowerCase().includes(searchTermLower) || // Verifica o título
        post.content.toLowerCase().includes(searchTermLower) // Verifica o conteúdo
      );
    } else {
      // Se o campo de busca estiver vazio, exibe todos os posts
      this.filteredPosts = this.posts;
    }
  }

  editPost(postId: number): void {
    this.router.navigate(['/blog/edit', postId]); // Navega para a página de edição
  }

  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe(() => {
      this.getPosts(); // Atualiza a lista de posts após a exclusão
      this.message = 'Post deletado com sucesso!';
      this.success = true;
      setTimeout(() => {
        this.message = '';
      }, 2000); // Remove a mensagem após 2 segundos
    }, error => {
      this.message = 'Falha ao deletar o post.';
      this.success = false;
    });
  }

  // Exporta o post como um arquivo .txt
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
}
