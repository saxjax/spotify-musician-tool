import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SpotifyAuthService } from './auth/spotify-auth.service';

@Component({
  selector: 'app-root',
  template: `
    <header class="app-header">
      <h1 class="title">Spotify Musician Tool</h1>
      @if (auth.isAuthenticated()) {
        <div class="auth-status">
          <span>✅ Connected to Spotify</span>
          <button type="button" (click)="logout()" class="logout-btn">Logout</button>
        </div>
      } @else {
        <a routerLink="/auth" class="connect-btn" aria-label="Connect Spotify">Connect Spotify</a>
      }
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    .title {
      margin: 0;
      font-size: 2.125rem;
    }
    .connect-btn, .logout-btn {
      padding: .5rem .75rem;
      border-radius: .5rem;
      border: 1px solid currentColor;
      text-decoration: none;
      background: transparent;
      cursor: pointer;
    }
    .auth-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `],
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  auth = inject(SpotifyAuthService);

  logout() {
    this.auth.logout();
  }
}
