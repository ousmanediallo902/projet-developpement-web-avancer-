import { Component, OnInit } from '@angular/core';
import { Product, ProductCreateDTO, ProductService } from '../core/services/product';
import { Category, CategoryService } from '../core/services/category';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produit-crud-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produit-crud-admin.html',
  styleUrl: './produit-crud-admin.scss'
})
export class ProduitCrudAdmin implements OnInit{
   products: Product[] = [];
  categories: Category[] = [];
  selectedProduct: Product | null = null;
  isEditing = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  productForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      prix: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      categorieId: ['', [Validators.required]]
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    
    // Aperçu de l'image
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    this.selectedFile = null;
  }
}

createProduct(): void {
  if (this.productForm.invalid) {
    this.markFormGroupTouched(this.productForm);
    return;
  }

  const productData: ProductCreateDTO = this.productForm.value;
  const imageFile = this.selectedFile || undefined; // Convertir null en undefined
  
  this.productService.createProduct(productData, imageFile).subscribe({
    next: (product) => {
      this.successMessage = 'Produit créé avec succès';
      this.resetForm();
      this.loadProducts();
      this.hideMessageAfterDelay();
    },
    error: (error) => {
      this.errorMessage = 'Erreur lors de la création du produit';
      console.error('Erreur:', error);
      this.hideMessageAfterDelay();
    }
  });
}

updateProduct(): void {
  if (this.productForm.invalid || !this.selectedProduct) {
    this.markFormGroupTouched(this.productForm);
    return;
  }

  const productData: Partial<ProductCreateDTO> = this.productForm.value;
  const imageFile = this.selectedFile || undefined; // Convertir null en undefined
  
  this.productService.updateProduct(this.selectedProduct.id, productData, imageFile).subscribe({
    next: (product) => {
      this.successMessage = 'Produit mis à jour avec succès';
      this.resetForm();
      this.loadProducts();
      this.hideMessageAfterDelay();
    },
    error: (error) => {
      this.errorMessage = 'Erreur lors de la mise à jour du produit';
      console.error('Erreur:', error);
      this.hideMessageAfterDelay();
    }
  });
}
  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.isEditing = true;
    this.productForm.patchValue({
      nom: product.nom,
      description: product.description,
      prix: product.prix,
      stock: product.stock,
      categorieId: product.categorieId
    });
    this.imagePreview = product.imageUrl || null;
  }

 

  deleteProduct(productId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.successMessage = 'Produit supprimé avec succès';
        this.loadProducts();
        this.hideMessageAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du produit';
        console.error('Erreur:', error);
        this.hideMessageAfterDelay();
      }
    });
  }

  resetForm(): void {
    this.productForm.reset();
    this.selectedProduct = null;
    this.isEditing = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Rupture de stock';
    if (stock < 10) return 'Stock faible';
    return 'En stock';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock < 10) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  }

}
