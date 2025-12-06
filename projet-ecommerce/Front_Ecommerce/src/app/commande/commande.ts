import { Component, OnInit } from '@angular/core';
import { CartItem, CartService } from '../core/services/panier';
import { Auth } from '../core/services/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { commandeService } from '../core/services/commande';

@Component({
  selector: 'app-commande',
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './commande.html',
  styleUrl: './commande.scss'
})
export class Commande implements OnInit {
  cart: any = { items: [], total: 0, totalItems: 0 };
  isLoading = false;
  isCreatingOrder = false;
  errorMessage = '';
  successMessage = '';
  modePaiement = 'CARTE_CREDIT';
  informationsLivraison = '';
  showModal: boolean = false;
  factureUrl: string = '';
  factureId!: number;
 
  constructor(
    private cartService: CartService,
    private authService: Auth,
    private commandeService: commandeService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    this.cartService.updateQuantity(item.produitId, newQuantity);
  }

  removeItem(produitId: number): void {
    this.cartService.removeFromCart(produitId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }



 



createOrder(): void {
  if (!this.authService.isAuthenticated()) {
    this.errorMessage = 'Veuillez vous connecter pour commander';
    setTimeout(() => this.errorMessage = '', 3000);
    return;
  }

  const stockCheck = this.cartService.checkStockAvailability();
  if (!stockCheck.disponible) {
    this.errorMessage = 'Problème de stock: ' + stockCheck.messages.join(', ');
    setTimeout(() => this.errorMessage = '', 5000);
    return;
  }

  this.isCreatingOrder = true;
  this.errorMessage = '';

  this.cartService.createCommandeFromCart(this.modePaiement, this.informationsLivraison).subscribe({
    next: (commande) => {
      // URL PDF retournée par le backend (ex: /api/factures/{id}/download)
      this.factureUrl = `/api/factures/${commande.factureId}/download`; 
      this.factureId = commande.factureId;   
      this.showModal = true;

      this.cartService.clearCart();
      this.isCreatingOrder = false;
    },
    error: (error) => {
      this.errorMessage = 'Erreur lors de la création de la commande: ' + error.message;
      this.isCreatingOrder = false;
      console.error('Erreur commande:', error);
      setTimeout(() => this.errorMessage = '', 5000);
    }
  });
}

closeModal(): void {
  this.showModal = false;
}


downloadFacture(): void {
  if (this.factureUrl) {
    // Extraire l'ID de la facture depuis l'URL
    const factureId = parseInt(this.factureUrl.split('/').pop()!, 10);
    this.commandeService.downloadFacture(factureId);
  }
}


}
