import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCategories(): void {
    this.http.get<Category[]>(`${this.apiUrl}/all`).subscribe((categories) => {
      this.categoriesSubject.next(categories);
    });
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/all`);
  }

  getCategoriesByPostId(postId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?postId=${postId}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http
      .post<Category>(this.apiUrl, category)
      .pipe(tap(() => this.loadCategories()));
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http
      .put<Category>(`${this.apiUrl}/${id}`, category)
      .pipe(tap(() => this.loadCategories()));
  }

  deleteCategory(categoryId: number): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http
      .delete(`${this.apiUrl}/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(tap(() => this.loadCategories()));
  }
}
