import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { Auth, User } from '../core/services/auth';

/**
 * Header avec logo, avatar, dropdown profil, bouton burger (mobile)
 * Gère l'ouverture/fermeture du menu profil et de la sidebar mobile
 */
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit{
currentUser: User | null = null;

 ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur connecté
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  /** Utilisateur connecté (nom, email, photo, rôle) */
  @Input() user: any;
  /** Affichage du dropdown profil */
  @Input() showDropdown = false;
  /** Affichage de la sidebar mobile */
  @Input() showSidebar = false;
  /** Ouvre la sidebar mobile */
  @Output() openSidebar = new EventEmitter<void>();
  /** Ferme la sidebar mobile */
  @Output() closeSidebar = new EventEmitter<void>();
  /** Ouvre/ferme le dropdown profil */
  @Output() toggleDropdown = new EventEmitter<void>();
  /** Ferme le dropdown profil */
  @Output() closeDropdown = new EventEmitter<void>();

  @ViewChild('avatarBtn', { static: false }) avatarBtn!: ElementRef;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu!: ElementRef;

  /** Retourne les initiales de l'utilisateur */
  getInitials() {
    return (this.user.prenom[0] + this.user.nom[0]).toUpperCase();
  }

  /** Gestion du clic global pour fermer le dropdown si clic hors menu/avatar */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.showDropdown &&
      this.avatarBtn &&
      this.dropdownMenu &&
      !this.avatarBtn.nativeElement.contains(target) &&
      !this.dropdownMenu.nativeElement.contains(target)
    ) {
      this.closeDropdown.emit();
    }
  }


  constructor(public authService:Auth){

  }
  


  logout() {
 this.authService.logout();
 
  }

}
