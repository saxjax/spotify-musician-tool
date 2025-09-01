import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotifyAuthService } from './spotify-auth.service';

@Component({
  selector: 'app-auth',
  template: `
    <section class="auth">
      <h2>Authorize with Spotify</h2>
      <p>Click the button to start the PKCE login flow.</p>
      <button type="button" class="start-login" (click)="login()" aria-label="Start Spotify Login">Start Login</button>
    </section>
  `,
  styles: [`.auth{padding:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  private auth = inject(SpotifyAuthService);

  async login(): Promise<void> {
    await this.auth.startLogin();
  }
}
