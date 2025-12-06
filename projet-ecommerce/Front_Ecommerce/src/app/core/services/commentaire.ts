import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CommentaireRequestDTO {
  contenu: string;
  note: number;
  userId: number;
  produitId: number;
}

export interface CommentaireResponseDTO {
  id: number;
  contenu: string;
  dateCommentaire: string;
  note: number;
  userId: number;
  userNom: string;
  userEmail: string;
  produitId: number;
  produitNom: string;
  produitPrix: number;
}


@Injectable({
  providedIn: 'root'
})
export class CommentaireService {
  
  private apiUrl = 'https://localhost:8443/api/commentaires';

  constructor(private http: HttpClient) {}

  /**
   * Créer un nouveau commentaire
   */
  createCommentaire(commentaireRequest: CommentaireRequestDTO): Observable<CommentaireResponseDTO> {
    return this.http.post<CommentaireResponseDTO>(this.apiUrl, commentaireRequest);
  }

  /**
   * Récupérer un commentaire par son ID
   */
  getCommentaireById(id: number): Observable<CommentaireResponseDTO> {
    return this.http.get<CommentaireResponseDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer tous les commentaires
   */
  getAllCommentaires(): Observable<CommentaireResponseDTO[]> {
    return this.http.get<CommentaireResponseDTO[]>(this.apiUrl);
  }

  /**
   * Mettre à jour un commentaire
   */
  updateCommentaire(id: number, commentaireRequest: CommentaireRequestDTO): Observable<CommentaireResponseDTO> {
    return this.http.put<CommentaireResponseDTO>(`${this.apiUrl}/${id}`, commentaireRequest);
  }

  /**
   * Supprimer un commentaire
   */
  deleteCommentaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les commentaires d'un produit spécifique
   */
  getCommentairesByProduit(produitId: number): Observable<CommentaireResponseDTO[]> {
    return this.http.get<CommentaireResponseDTO[]>(`${this.apiUrl}/produit/${produitId}`);
  }

  /**
   * Récupérer les commentaires d'un utilisateur spécifique
   */
  getCommentairesByUser(userId: number): Observable<CommentaireResponseDTO[]> {
    return this.http.get<CommentaireResponseDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Récupérer les commentaires avec pagination
   */
  getCommentairesPaginated(page: number = 0, size: number = 10, sort: string = 'dateCommentaire,desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(`${this.apiUrl}/paginated`, { params });
  }

  /**
   * Récupérer la note moyenne d'un produit
   */
  getNoteMoyenneByProduit(produitId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/produit/${produitId}/note-moyenne`);
  }

  /**
   * Récupérer les statistiques des commentaires
   */
  getStatsByProduit(produitId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/produit/${produitId}/stats`);
  }
  
}
