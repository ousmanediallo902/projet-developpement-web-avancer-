import { Routes } from '@angular/router';
import { Acceuil } from './acceuil/acceuil';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { Produit } from './produit/produit';
import { Categorie } from './categorie/categorie';
import { Utilisateur } from './utilisateur/utilisateur';
import { Promotion } from './promotion/promotion';
import { Statistique } from './statistique/statistique';
import { Commande } from './commande/commande';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { authGuard } from './core/guards/auth-guard';
import { ProduitCrudAdmin } from './produit-crud-admin/produit-crud-admin';
import { CommentsProduct } from './comments-product/comments-product';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'admin', component: Acceuil,
     canActivate:[authGuard], 
     children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'produits', component: Produit },
      { path: 'categories', component: Categorie },
      { path: 'utilisateurs', component: Utilisateur },
      { path: 'promotions', component: Promotion },
      { path: 'statistiques', component: Statistique },
      { path: 'commandes', component: Commande },
      { path: 'CrudProduit', component: ProduitCrudAdmin },
      { path: 'produits/:id/commentaires', component: CommentsProduct },


     ]
  },
];
