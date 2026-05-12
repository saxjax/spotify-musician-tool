import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    @if (error()) {
      <div class="error-container">
        <h2>Login Error</h2>
        <p>{{ error() }}</p>
        <button type="button" (click)="retry()">Try Again</button>
      </div>
    } @else {
      <div class="loading-container">
        <p>Completing login...</p>
      </div>
    }
  `,
  styles: `
    .error-container, .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    button {
      background: #1db954;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 2rem;
      cursor: pointer;
      margin-top: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(SpotifyAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const result = await this.auth.handleCallbackFromUrl(window.location.href);
    if (result.ok) {
      // Navigate to the app base href so we return to the musician app
      const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
      // Use navigateByUrl to ensure the full base path is used (handles subpath hosting)
      this.router.navigateByUrl(baseHref, { replaceUrl: true });
    } else {
      this.error.set(result.error ?? 'Unknown error');
    }
  }

  retry(): void {
    this.router.navigate(['/auth']);
  }
}
