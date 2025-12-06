import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  pays: string;
  region: string;
  departement: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  pays?: string;
  region?: string;
  departement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://localhost:8443/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private currentEmail: string = ''; // Stocker l'email temporairement

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage();
  }

  // === LOGIN ===
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Stocker l'email pour l'utiliser dans extractUserFromToken si nécessaire
    this.currentEmail = credentials.email;
    
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      responseType: 'text' // Accepter une réponse texte
    }).pipe(
      map((response: string) => {
        console.log('Réponse brute du serveur:', response);
        
        // Essayer de parser comme JSON d'abord
        try {
          const jsonResponse = JSON.parse(response);
          return jsonResponse;
        } catch (e) {
          // Si ce n'est pas du JSON, c'est probablement juste le token
          console.log('Réponse n\'est pas du JSON, traitement comme token JWT');
          return {
            token: response,
            user: this.extractUserFromToken(response)
          };
        }
      }),
      tap(response => {
        console.log('Réponse traitée:', response);
        this.storeAuthData(response);
        this.currentUserSubject.next(response.user);
        this.redirectBasedOnRole(response.user.role);
        this.currentEmail = ''; // Réinitialiser après utilisation
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.currentEmail = ''; // Réinitialiser en cas d'erreur
        return throwError(() => new Error(
          error.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.'
        ));
      })
    );
  }

  // Méthode pour extraire les infos utilisateur du token JWT
  private extractUserFromToken(token: string): User {
    try {
      // Décoder le payload du token JWT (partie du milieu)
      const payload = token.split('.')[1];
      if (!payload) {
        throw new Error('Token JWT invalide');
      }
      
      // Remplacer les caractères URL-safe et padding
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userData = JSON.parse(decodedPayload);
      console.log('Données utilisateur extraites du token:', userData);
      
      return {
        id: userData.id || userData.userId || 0,
        nom: userData.nom || userData.name || userData.sub || 'Utilisateur',
        email: userData.email || this.currentEmail || '', // Utiliser l'email stocké
        role: userData.role || userData.authorities?.[0] || 'USER',
        telephone: userData.telephone || userData.phone || '',
        pays: userData.pays || userData.country || '',
        region: userData.region || userData.state || '',
        departement: userData.departement || userData.department || ''
      };
    } catch (e) {
      console.error('Erreur lors de l\'extraction des données du token:', e);
      // Retourner un utilisateur par défaut en cas d'erreur
      return {
        id: 0,
        nom: 'Utilisateur',
        email: this.currentEmail || '', // Utiliser l'email stocké
        role: 'USER',
        telephone: '',
        pays: '',
        region: '',
        departement: ''
      };
    }
  }

  // === REGISTER ===
register(userData: RegisterRequest): Observable<AuthResponse> {
  return this.http.post(`${this.apiUrl}/register`, userData, {
    responseType: 'text' // Accepter une réponse texte
  }).pipe(
    map((response: string) => {
      console.log('Réponse brute register:', response);
      
      try {
        // Essayer de parser comme JSON
        const jsonResponse = JSON.parse(response);
        return jsonResponse;
      } catch (e) {
        // Si ce n'est pas du JSON, créer une réponse par défaut
        console.log('Réponse register n\'est pas du JSON');
        return {
          token: null, // Pas de token pour l'inscription
          user: {
            id: 0,
            nom: userData.nom,
            email: userData.email,
            role: 'CLIENT', // Rôle par défaut
            telephone: userData.telephone || '',
            pays: userData.pays || '',
            region: userData.region || '',
            departement: userData.departement || ''
          }
        };
      }
    }),
    tap(response => {
      console.log('Réponse register traitée:', response);
      // Pour l'inscription, on ne stocke pas de token (l'utilisateur doit se connecter)
      this.currentUserSubject.next(response.user);
      // Redirection vers login après inscription
      this.router.navigate(['/login'], {
        queryParams: { message: 'Inscription réussie! Vous pouvez maintenant vous connecter.' }
      });
    }),
    catchError(error => {
      console.error('Register error:', error);
      return throwError(() => new Error(
        error.error?.message || 'Erreur lors de la création du compte.'
      ));
    })
  );
}

  // === LOGOUT ===
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // === REDIRECTION BASÉE SUR LE RÔLE ===
  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT':
        this.router.navigate(['/admin/dashboard']);
        break;  
      case 'USER':
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  // === GETTERS ===
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('authToken') : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  isUser(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'USER';
  }

  // === STORAGE MANAGEMENT ===
  private storeAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          this.currentUserSubject.next(JSON.parse(userJson));
        } catch (e) {
          console.error('Error parsing user data from storage:', e);
          this.logout();
        }
      }
    }
  }

  // === REFRESH USER INFO ===
  refreshUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }
}