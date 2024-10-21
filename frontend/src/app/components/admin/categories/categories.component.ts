import { Observable } from 'rxjs';

import { Component } from '@angular/core';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  categories$: Observable<Category[]>; // Para armazenar as categorias
  loading: boolean = true;
  message: string | null = null;
  editingCategory: Category | null = null; // Para edição de categoria
  newCategory: Category = { name: '', postId: 0 }; // Inclui postId

  constructor(private categoryService: CategoryService) {
    this.categories$ = this.categoryService.getAllCategories(); // Inicializa as categorias
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getAllCategories(); // Carrega as categorias
    this.loading = false; // Define loading como false após o carregamento
  }

  // Método para editar categorias
  startEditCategory(category: Category) {
    this.editingCategory = { ...category }; // Clona a categoria para edição
  }

  saveEditCategory() {
    if (this.editingCategory && this.editingCategory.id !== undefined) {
      this.categoryService.updateCategory(this.editingCategory.id, this.editingCategory).subscribe(
        () => {
          this.message = 'Category updated successfully!';
          this.loadCategories(); // Recarrega as categorias após a atualização
        },
        (error) => {
          console.error('Error updating category:', error);
          this.message = 'Failed to update category.';
        }
      );
      this.editingCategory = null; // Limpa a edição após o salvamento
    } else {
      console.warn('Editing category is not defined or does not have an ID.');
      this.message = 'Failed to update category. ID is missing.';
    }
  }

  cancelEditCategory() {
    this.editingCategory = null; // Limpa a edição
  }

  addCategory() {
    this.categoryService.createCategory(this.newCategory).subscribe(
      () => {
        this.message = 'Category created successfully!';
        this.loadCategories(); // Recarrega as categorias após a criação
        this.newCategory = { name: '', postId: 0 }; // Reseta o campo da nova categoria
      },
      (error) => {
        console.error('Error creating category:', error);
        this.message = 'Failed to create category.';
      }
    );
  }

  deleteCategory(categoryId: number): void {
    this.categoryService.deleteCategory(categoryId).subscribe(
      () => {
        this.message = 'Category deleted successfully!';
        this.loadCategories(); // Recarrega as categorias após a deleção
      },
      (error) => {
        console.error('Error deleting category:', error);
        this.message = 'Failed to delete category.';
      }
    );
  }
}
