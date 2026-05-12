import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';

@Component({
  selector: 'app-auth',
  template: `
    <div class="auth-container">
      <h2>Connect to Spotify</h2>
      <p>Sign in with your Spotify account to use the Musician Practice Tool.</p>
      <button type="button" (click)="login()" class="login-btn">Login with Spotify</button>
    </div>
  `,
  styles: `
    .auth-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    .login-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 2rem;
      font-size: 1rem;
      cursor: pointer;
    }
    .login-btn:hover {
      background: #1ed760;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private auth = inject(SpotifyAuthService);

  login(): void {
    this.auth.startLogin();
  }
}
