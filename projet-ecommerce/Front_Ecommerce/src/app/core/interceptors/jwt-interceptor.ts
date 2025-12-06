import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '../services/auth';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: Auth) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    if (token && this.shouldAddToken(request)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }

  private shouldAddToken(request: HttpRequest<any>): boolean {
    // Ne pas ajouter le token pour les routes d'authentification
    if (request.url.includes('/api/auth/')) {
      return false;
    }
    return true;
  }
}