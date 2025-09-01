import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <header class="app-header">
      <h1 class="title">Spotify Musician Tool</h1>
      <a routerLink="/auth" class="connect-btn" aria-label="Connect Spotify">Connect Spotify</a>
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
    .connect-btn {
      padding: .5rem .75rem;
      border-radius: .5rem;
      border: 1px solid currentColor;
      text-decoration: none;
    }
  `],
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
