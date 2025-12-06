import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-acceuil',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.scss']
})
export class Acceuil {
  // Utilisateur connecté 
  user = {
    prenom: 'Ousmane',
    nom: 'Diallo',
    email: 'diallo@email.com',
    role: 'ADMIN',
    photoUrl: '' // Mettre une URL d'image si disponible
  };

  // État du dropdown profil (header)
  showDropdown = false;
  // État de la sidebar mobile
  showSidebar = false;

  // Ouvre/ferme le dropdown profil
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  closeDropdown() {
    this.showDropdown = false;
  }

  // Ouvre/ferme la sidebar mobile
  openSidebar() {
    this.showSidebar = !this.showSidebar;
  }
  closeSidebar() {
    this.showSidebar = false;
  }

 
}
