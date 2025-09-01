import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  template: `
    <section class="auth">
      <h2>Authorize with Spotify</h2>
      <p>Click the button to start the PKCE login flow.</p>
      <button type="button" class="start-login" aria-label="Start Spotify Login">Start Login</button>
    </section>
  `,
  styles: [`.auth{padding:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {}

