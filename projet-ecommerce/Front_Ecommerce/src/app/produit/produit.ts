import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../core/services/product';
import { CartService } from '../core/services/panier';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produit.html',
  styleUrl: './produit.scss'
})
export class Produit implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = ''; // <-- Ajout pour les messages de succès

  filters = {
    search: '',
    minPrix: undefined as number | undefined,
    maxPrix: undefined as number | undefined,
    categorieId: undefined as number | undefined
  };

  constructor(
    private productService: ProductService, // <-- Corrigé le nom
    private cartService: CartService, // <-- Ajout du service panier
    private authService: Auth, // <-- Pour vérifier l'authentification
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.isLoading = false;
        this.products = products;
        this.filteredProducts = products;
         this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.isLoading = false;
        console.error('Erreur:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // Méthode pour ajouter au panier
  addToCart(product: Product): void {
    // Vérifier si le produit est en stock
    if (product.stock === 0) {
      this.errorMessage = 'Ce produit est indisponible';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Veuillez vous connecter pour ajouter au panier';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Ajouter au panier
    this.cartService.addToCart(product, 1);
    this.successMessage = `${product.nom} ajouté au panier !`;
    
    // Effacer le message après 3 secondes
    setTimeout(() => this.successMessage = '', 3000);
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      if (this.filters.search && 
          !product.nom.toLowerCase().includes(this.filters.search.toLowerCase()) &&
          !product.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      if (this.filters.minPrix !== undefined && product.prix < this.filters.minPrix) {
        return false;
      }
      if (this.filters.maxPrix !== undefined && product.prix > this.filters.maxPrix) {
        return false;
      }
      if (this.filters.categorieId !== undefined && product.categorieId !== this.filters.categorieId) {
        return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      minPrix: undefined,
      maxPrix: undefined,
      categorieId: undefined
    };
    this.filteredProducts = this.products;
  }

  getStockStatus(stock: number): string {
    if (stock === 0) {
      return 'Rupture de stock';
    } else if (stock < 10) {
      return 'Stock faible';
    } else {
      return 'En stock';
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) {
      return 'text-red-600 bg-red-100';
    } else if (stock < 10) {
      return 'text-orange-600 bg-orange-100';
    } else {
      return 'text-green-600 bg-green-100';
    }
  }
}