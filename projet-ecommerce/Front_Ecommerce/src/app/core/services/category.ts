import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  nom: string;
  description?: string;
  nombreProduits?: number;
}

export interface CategoryCreateDTO {
  nom: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:8443/api/categories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(categoryData: CategoryCreateDTO): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, categoryData: Partial<CategoryCreateDTO>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategoriesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`);
  }

  getCategoriesWithProductCount(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/with-count`);
  }
}