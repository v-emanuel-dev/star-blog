import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createCategory(name: string): Observable<any> {
    return this.http.post(this.apiUrl, { name });
  }

  updateCategory(categoryId: number, updatedCategory: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${categoryId}`, updatedCategory);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
