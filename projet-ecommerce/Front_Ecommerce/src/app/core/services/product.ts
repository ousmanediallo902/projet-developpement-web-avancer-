import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  imageUrl?: string;
  categorieId: number;
  categorieNom: string;  
}

export interface ProductCreateDTO {
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorieId: number;
}

export interface ProductFilters {
  categorieId?: number;
  minPrix?: number;
  maxPrix?: number;
  promotion?: boolean;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {   // <-- renommé
  private apiUrl = 'https://localhost:8443/api/produits';
  private baseUrl = 'https://localhost:8443';

  constructor(private http: HttpClient) {}

  getAllProducts(filters?: ProductFilters): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.categorieId) params = params.set('categorieId', filters.categorieId.toString());
      if (filters.minPrix) params = params.set('minPrix', filters.minPrix.toString());
      if (filters.maxPrix) params = params.set('maxPrix', filters.maxPrix.toString());
      if (filters.promotion !== undefined) params = params.set('promotion', filters.promotion.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      map(products =>
        products.map(p => ({
          ...p,
          imageUrl: p.imageUrl ? `${this.baseUrl}${p.imageUrl}` : 'assets/no-image.png'
        }))
      )
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: ProductCreateDTO, image?: File): Observable<Product> {
    const formData = new FormData();
    formData.append('produit', JSON.stringify(productData));
    if (image) {
      formData.append('image', image);
    }
    return this.http.post<Product>(this.apiUrl, formData);
  }

  updateProduct(id: number, productData: Partial<ProductCreateDTO>, image?: File): Observable<Product> {
    const formData = new FormData();
    formData.append('produit', JSON.stringify(productData));
    if (image) {
      formData.append('image', image);
    }
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategorie(categorieId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/categorie/${categorieId}`);
  }

  getProductsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`);
  }

  getLowStockProducts(limit: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock?limit=${limit}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${query}`);
  }
}
