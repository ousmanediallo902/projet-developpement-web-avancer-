import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LigneCommande {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  produitNom: string;
}

export interface Commande {
  id: number;
  dateCommande: string;
  statut: string;
  total: number;
  userId: number;
  factureId : number;
  paiementId : number;
  referencePaiement?: string;
  lignes: LigneCommande[];
}

export interface CommandeRequest {
  userId: number;
  modePaiement: string;
  informationsLivraison?: string;
  lignes: Array<{
    produitId: number;
    quantite: number;
  }>;
}

export interface CommandeFilters {
  statut?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class commandeService {
  
  private apiUrl = 'https://localhost:8443/api/commandes';

  constructor(private http: HttpClient) {}

  getAllCommandes(filters?: CommandeFilters): Observable<Commande[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.statut) params = params.set('statut', filters.statut);
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<Commande[]>(this.apiUrl, { params });
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  createCommande(commandeData: CommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commandeData);
  }

  updateCommandeStatus(id: number, statut: string): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserCommandes(userId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Total commandes
getCommandesCount(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/stats/count`);
}

  // Chiffre d'affaires
getTotalRevenue(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/stats/chiffre-affaires`);
}

 // Commandes récentes
getRecentOrders(limit: number = 5): Observable<Commande[]> {
  return this.http.get<Commande[]>(`${this.apiUrl}/recent?limit=${limit}`);
}
  
  

downloadFacture(factureId: number): void {
  this.http.get(`https://localhost:8443/api/factures/${factureId}/download`, { responseType: 'blob' })
    .subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${factureId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Erreur téléchargement facture', error);
    });
}


}
