import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CartService } from '../core/services/panier';

/**
 * Sidebar professionnelle (navigation rapide)
 * - Fixe à gauche sur desktop
 * - Drawer slide-in sur mobile
 * - Gère l'ouverture/fermeture sur mobile
 */
@Component({
  selector: 'app-sidebar',
  imports: [   
    RouterModule,RouterLinkActive,RouterLink
  ],
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  /** Affichage de la sidebar mobile (drawer) */
  @Input() showSidebar = false;
  /** Ferme la sidebar mobile */
  @Output() closeSidebar = new EventEmitter<void>();
  /** Référence pour la gestion du clic global */
  @ViewChild('sidebarDrawer', { static: false }) sidebarDrawer!: ElementRef;

cartItemCount = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });
  }

}
