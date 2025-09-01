import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/callback', loadComponent: () => import('./auth/callback.component').then(m => m.AuthCallbackComponent) },
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: '**', redirectTo: '' }
];
