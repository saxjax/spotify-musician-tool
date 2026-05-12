import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadComponent: () => import('./components/auth/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/callback', loadComponent: () => import('./components/auth/login-error/login-error.component').then(m => m.AuthCallbackComponent) },
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: '**', redirectTo: '' }
];
