// category.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories'; // Ajuste conforme sua API
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable(); // Expondo o observable

  constructor(private http: HttpClient) {
    // Opcional: carregar categorias iniciais, se necessário
    this.getAllCategories().subscribe(categories => this.categoriesSubject.next(categories));
  }

  startEditCategory(categoryId: number) {
    const categories = this.categoriesSubject.value;
    const categoryToEdit = categories.find(category => category.id === categoryId);
    if (categoryToEdit) {
      // Emitir categoria para edição
      console.log('Editando categoria:', categoryToEdit);
      // Adicione a lógica para editar aqui
    }
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/all`).pipe(
      tap(categories => this.categoriesSubject.next(categories)) // Atualizando o BehaviorSubject
    ); // Usando a nova rota
  }

  getCategoriesByPostId(postId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?postId=${postId}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap(newCategory => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next([...currentCategories, newCategory]); // Atualizando o BehaviorSubject
      })
    ); // Ajuste a URL conforme necessário
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category).pipe(
      tap(updatedCategory => {
        const currentCategories = this.categoriesSubject.value;
        const updatedCategories = currentCategories.map(cat => cat.id === id ? updatedCategory : cat);
        this.categoriesSubject.next(updatedCategories); // Atualizando o BehaviorSubject
      })
    );
  }

  deleteCategory(categoryId: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.delete(`${this.apiUrl}/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      tap(() => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next(currentCategories.filter(cat => cat.id !== categoryId)); // Atualizando o BehaviorSubject
      })
    );
  }
}
