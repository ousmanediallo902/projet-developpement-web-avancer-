import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product, ProductService } from '../core/services/product';
import { CommentaireRequestDTO, CommentaireResponseDTO, CommentaireService } from '../core/services/commentaire';
import { Auth, User } from '../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments-product',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './comments-product.html',
  styleUrl: './comments-product.scss'
})
export class CommentsProduct implements OnInit , OnDestroy {
  product: Product | null = null;
  commentaires: CommentaireResponseDTO[] = [];
  nouveauCommentaire = {
    contenu: '',
    note: 5
  };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  userRating = 0;
  hoverRating = 0;
  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private commentaireService: CommentaireService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    // S'abonner à l'observable public currentUser$
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadProductAndComments();
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadProductAndComments(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.errorMessage = 'Produit non trouvé';
      this.isLoading = false;
      return;
    }

    // Charger le produit
    this.productService.getProductById(+productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loadCommentaires(+productId);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du produit';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadCommentaires(productId: number): void {
    this.commentaireService.getCommentairesByProduit(productId).subscribe({
      next: (commentaires) => {
        this.commentaires = commentaires;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des commentaires';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  setRating(rating: number): void {
    this.nouveauCommentaire.note = rating;
    this.userRating = rating;
  }

  hoverStar(rating: number): void {
    this.hoverRating = rating;
  }

  resetStars(): void {
    this.hoverRating = 0;
  }

  ajouterCommentaire(): void {
    // Vérifier si l'utilisateur est connecté en utilisant la variable currentUser
    if (!this.currentUser) {
      this.errorMessage = 'Veuillez vous connecter pour ajouter un commentaire';
      setTimeout(() => this.errorMessage = '', 3000);
      this.router.navigate(['/login']);
      return;
    }

    // Validation
    if (!this.nouveauCommentaire.contenu.trim()) {
      this.errorMessage = 'Veuillez saisir un commentaire';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!this.product) {
      this.errorMessage = 'Produit non trouvé';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const commentaireRequest: CommentaireRequestDTO = {
      contenu: this.nouveauCommentaire.contenu.trim(),
      note: this.nouveauCommentaire.note,
      userId: this.currentUser.id, // Utiliser this.currentUser
      produitId: this.product.id
    };

    this.commentaireService.createCommentaire(commentaireRequest).subscribe({
      next: (commentaire) => {
        this.commentaires.unshift(commentaire);
        this.successMessage = 'Votre commentaire a été ajouté avec succès';
        this.nouveauCommentaire = { contenu: '', note: 5 };
        this.userRating = 0;
        this.isSubmitting = false;
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'ajout du commentaire';
        this.isSubmitting = false;
        console.error('Erreur:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  supprimerCommentaire(commentaireId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    this.commentaireService.deleteCommentaire(commentaireId).subscribe({
      next: () => {
        this.commentaires = this.commentaires.filter(c => c.id !== commentaireId);
        this.successMessage = 'Commentaire supprimé avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du commentaire';
        console.error('Erreur:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  peutSupprimerCommentaire(commentaire: CommentaireResponseDTO): boolean {
    // Utiliser this.currentUser au lieu d'accéder à currentUserSubject
    return this.currentUser?.id === commentaire.userId || this.currentUser?.role === 'ADMIN';
  }

  calculerNoteMoyenne(): number {
    if (this.commentaires.length === 0) return 0;
    
    const total = this.commentaires.reduce((sum, comment) => sum + comment.note, 0);
    return Math.round((total / this.commentaires.length) * 10) / 10;
  }

  getStarsArray(note: number): any[] {
    return Array(5).fill(0).map((_, i) => i < note);
  }

  // Méthode alternative utilisant directement le service Auth
  estConnecte(): boolean {
    return this.authService.isAuthenticated();
  }

  // Méthode alternative pour obtenir l'ID utilisateur
  obtenirUserId(): number | null {
    return this.currentUser?.id || null;
  }
}
