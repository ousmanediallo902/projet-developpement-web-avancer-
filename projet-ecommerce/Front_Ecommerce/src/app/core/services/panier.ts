// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, User } from './auth';
import { Commande, CommandeRequest, commandeService } from './commande';

export interface CartItem {
  produitId: number;
  nom: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();
  private currentUser: User | null = null;

  constructor(
    private commandeService: commandeService,
    private authService: Auth
  ) {
    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private getInitialCart(): Cart {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0, totalItems: 0 };
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  private calculateTotals(items: CartItem[]): { total: number, totalItems: number } {
    const total = items.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantite, 0);
    return { total, totalItems };
  }

  addToCart(product: any, quantite: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.produitId === product.id);

    let newItems: CartItem[];

    if (existingItemIndex > -1) {
      newItems = [...currentCart.items];
      const newQuantite = newItems[existingItemIndex].quantite + quantite;
      newItems[existingItemIndex].quantite = Math.min(newQuantite, product.stock);
    } else {
      const newItem: CartItem = {
        produitId: product.id,
        nom: product.nom,
        prix: product.prix,
        quantite: Math.min(quantite, product.stock),
        imageUrl: product.imageUrl,
        stock: product.stock
      };
      newItems = [...currentCart.items, newItem];
    }

    const { total, totalItems } = this.calculateTotals(newItems);
    const newCart: Cart = { items: newItems, total, totalItems };

    this.saveCart(newCart);
  }

  removeFromCart(produitId: number): void {
    const currentCart = this.cartSubject.value;
    const newItems = currentCart.items.filter(item => item.produitId !== produitId);
    const { total, totalItems } = this.calculateTotals(newItems);
    const newCart: Cart = { items: newItems, total, totalItems };

    this.saveCart(newCart);
  }

  updateQuantity(produitId: number, quantite: number): void {
    if (quantite <= 0) {
      this.removeFromCart(produitId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const newItems = currentCart.items.map(item =>
      item.produitId === produitId ? { ...item, quantite: Math.min(quantite, item.stock) } : item
    );

    const { total, totalItems } = this.calculateTotals(newItems);
    const newCart: Cart = { items: newItems, total, totalItems };

    this.saveCart(newCart);
  }

  clearCart(): void {
    const newCart: Cart = { items: [], total: 0, totalItems: 0 };
    this.saveCart(newCart);
  }

  getCart(): Cart {
    return this.cartSubject.value;
  }

  // Méthode pour créer une commande à partir du panier
  createCommandeFromCart(modePaiement: string, informationsLivraison?: string): Observable<Commande> {
    // Utiliser this.currentUser au lieu de currentUserSubject
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const cart = this.getCart();
    
    const commandeRequest: CommandeRequest = {
      userId: this.currentUser.id,
      modePaiement: modePaiement,
      informationsLivraison: informationsLivraison,
      lignes: cart.items.map(item => ({
        produitId: item.produitId,
        quantite: item.quantite
      }))
    };

    return this.commandeService.createCommande(commandeRequest);
  }

  // Vérifier la disponibilité des produits
  checkStockAvailability(): { disponible: boolean; messages: string[] } {
    const cart = this.getCart();
    const messages: string[] = [];

    cart.items.forEach(item => {
      if (item.quantite > item.stock) {
        messages.push(`${item.nom}: Quantité demandée (${item.quantite}) dépasse le stock disponible (${item.stock})`);
      }
    });

    return {
      disponible: messages.length === 0,
      messages: messages
    };
  }
}