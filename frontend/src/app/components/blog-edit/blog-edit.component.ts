import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service'; // Importe o AuthService
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css'],
})
export class BlogEditComponent implements OnInit {
  postId!: number; // Para armazenar o ID do post sendo editado
  title: string = ''; // Campo para armazenar o título do post
  content: string = ''; // Campo para armazenar o conteúdo do post
  userId!: number; // Para armazenar o ID do usuário logado
  visibility: 'public' | 'private' = 'public'; // Inicializa como público
  message: string = ''; // Para armazenar a mensagem a ser exibida
  success: boolean = false; // Para indicar sucesso ou falha
  selectedCategoryId: number | null = null;
  selectedCategoryIds: number[] = []; // Inicializa como um array vazio
  categories: Category[] = [];
  newCategoryName: string = '';
  currentPostId: number | null = null;
  categoryId: number | null = null;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentPostId = +params['postId']; // Converte o postId para número
      console.log('Post ID atual:', this.currentPostId);

      // Chame loadCategories apenas se currentPostId não for null
      if (this.currentPostId !== null) {
        this.loadCategories(this.currentPostId); // Passa o currentPostId como argumento
      } else {
        console.error(
          'currentPostId é null. Não é possível carregar categorias.'
        );
      }
    });

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
        this.visibility = post.visibility as 'public' | 'private';
      },
      error: () => {
        this.message = 'Failed to load post.';
        this.success = false;
        this.router.navigate(['/blog']); // Redireciona se falhar ao carregar
      },
    });
  }

  // Método para atualizar o post
  updatePost(): void {
    const updatedPost: Post = {
      id: this.postId,
      title: this.title,
      content: this.content,
      user_id: this.userId,
      visibility: this.visibility,
      created_at: new Date().toISOString(),
      username: '',
      categoryIds: this.selectedCategoryIds, // Agora usa um array de IDs de categorias
    };

    this.postService.updatePost(this.postId, updatedPost).subscribe(
      () => {
        this.message = 'Update successful!';
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/blog']);
        }, 1500);
      },
      (error) => {
        console.error('Error updating post:', error);
        this.message = 'Failed to update post.';
        this.success = false;
      }
    );
  }

  loadCategories(postId: number): void {
    this.categoryService.getAllCategories().subscribe(
      (data: Category[]) => {
        this.categories = data; // Armazena as categorias
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    );
  }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const category: Omit<Category, 'id'> = {
        name: this.newCategoryName,
        postId: this.currentPostId, // Certifique-se de que postId esteja associado corretamente
      };

      this.categoryService.createCategory(category).subscribe({
        next: () => {
          if (this.currentPostId !== null) {
            this.loadCategories(this.currentPostId);
          } else {
            console.error('currentPostId is null. Cannot load categories.');
          }
          this.newCategoryName = ''; // Limpa o campo após a adição
        },
        error: (error) => {
          console.error('Erro ao criar categoria:', error);
        },
      });
    } else {
      console.error('O nome da categoria não pode estar vazio');
    }
  }

  editCategory(category: Category): void {
    this.newCategoryName = category.name;
    this.selectedCategoryId = category.id !== undefined ? category.id : null;
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          if (this.currentPostId !== null) {
            this.loadCategories(this.currentPostId); // Passa o postId para recarregar as categorias
          } else {
            console.error(
              'currentPostId is null. Cannot load categories after deletion.'
            );
          }

          this.message = 'Category deleted successfully!';
          this.success = true;
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.message = 'Failed to delete category.';
        },
      });
    }
  }

  onCategoryChange(event: Event, categoryId: number): void {
    event.preventDefault(); // Previne o comportamento padrão

    const isChecked = this.selectedCategoryIds.includes(categoryId);

    if (isChecked) {
      // Remove o ID se o botão for clicado novamente
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    } else {
      // Adiciona o ID se o botão for clicado
      this.selectedCategoryIds.push(categoryId);
    }

    console.log('Categorias selecionadas:', this.selectedCategoryIds);
  }

}
