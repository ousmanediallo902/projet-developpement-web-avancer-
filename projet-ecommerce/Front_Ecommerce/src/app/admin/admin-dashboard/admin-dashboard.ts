import { Component, OnInit } from '@angular/core';
import { Cart, CartService } from '../../core/services/panier';
import { Auth } from '../../core/services/auth';
import { Commande, commandeService } from '../../core/services/commande';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,   
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  cart: Cart = { items: [], total: 0, totalItems: 0 };
  totalCommandes: number = 0;
  chiffreAffaires: number = 0;
  recentOrders: Commande[] = [];

  constructor(
    private cartService: CartService,
    private commandeService: commandeService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart: Cart) => this.cart = cart);

    this.commandeService.getCommandesCount().subscribe((count: number) => this.totalCommandes = count);
    this.commandeService.getTotalRevenue().subscribe((revenue: number) => this.chiffreAffaires = revenue);
    this.commandeService.getRecentOrders(5).subscribe((orders: Commande[]) => this.recentOrders = orders);
  }

  downloadFacture(factureId: number) {
    this.commandeService.downloadFacture(factureId);
  }
}