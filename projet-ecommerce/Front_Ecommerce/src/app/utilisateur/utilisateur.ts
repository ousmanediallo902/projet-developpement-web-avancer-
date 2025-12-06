import { Component, OnInit } from '@angular/core';
import { Auth, User } from '../core/services/auth';
import { UserService } from '../core/services/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilisateur',
  imports: [CommonModule,FormsModule],
  templateUrl: './utilisateur.html',
  styleUrl: './utilisateur.scss'
})
export class Utilisateur implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  currentUser: User | null = null; // ← Stocker l'utilisateur courant

  constructor(
    private userService: UserService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    // S'abonner à l'observable public currentUser$
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur supprimé avec succès';
        this.loadUsers(); // Recharger la liste
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
        console.error('Erreur:', error);
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.nom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredUsers = this.users;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Utilisez currentUser au lieu d'accéder à currentUserSubject
  canDeleteUser(user: User): boolean {
    return this.currentUser?.id !== user.id;
  }
}
